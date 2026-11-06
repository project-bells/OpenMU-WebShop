import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import {
  DEFAULT_WEBSHOP_CONFIG,
  INITIAL_GROUPS,
} from '../data/initialState';
import { INITIAL_WEBSHOP_ITEMS, WebShopItem } from '../data/webshopItems';
import {
  ItemGroup,
  PayPalPromoPackage,
  PromotionConfig,
  TrueMoneyPromoTier,
  UserRole,
  VaultItemInstance,
  WebShopConfig,
} from '../types/webshop';
import { CATEGORY_NAMES } from '../utils/muItemLogic';
import { recordAuditLog } from './auditLogger';
import {
  encodeSeason6ItemHex,
  encodeWarehouseHex3840,
  generateUniqueItemSerial,
  locateFreeWarehouseSlot,
  sanitizeAndPriceGroupSet,
  sanitizeAndPriceSingleItem,
  verifySlotPlacement,
} from './muItemHex';
import {
  cacheDeleteKeys,
  cacheGetJson,
  cacheSetJson,
  claimIdempotencyKey,
  finalizeIdempotencyKey,
  releaseIdempotencyKey,
} from './redisCache';

const { Pool } = pg;

export type CashShopCoinType = 'WCoinC' | 'WCoinP' | 'GoblinPoints';

export interface OpenMuCoinGrant {
  id: string;
  accountLoginName: string;
  coinType: CashShopCoinType;
  amount: number;
  creditsAdded: number;
  reason: string;
  reference: string;
  idempotencyKey: string;
  clientName: string;
  createdAt: string;
  status: 'Created' | 'AlreadyGranted';
}

export interface MembStatRow {
  memb___id: string;
  ConnectStat: 0 | 1;
  ServerName: string;
  IP: string;
  ConnectTM: string | null;
  DisConnectTM: string | null;
}

export interface ServerAccountRecord {
  id: string;
  loginName: string;
  passwordPlainOrSimulatedBcrypt: string;
  passwordHash: string;
  securityCode: string;
  email: string;
  state: 'Normal' | 'Spectator' | 'GameMaster' | 'Banned' | 'TemporarilyBanned';
  role: UserRole;
  isMasterAdmin: boolean;
  registrationDate: string;
  credits: number;
  vaultMoney: number;
  wCoinC: number;
  wCoinP: number;
  goblinPoints: number;
  vipUntil: string | null;
  vaultItems: VaultItemInstance[];
}

export interface CachedCatalogBundle {
  version: number;
  generatedAt: string;
  items: WebShopItem[];
  categories: Array<{
    id: number;
    names: (typeof CATEGORY_NAMES)[number];
    activeCount: number;
    bannedCount: number;
  }>;
  groups: ItemGroup[];
  pricing: WebShopConfig['credits'];
  limits: WebShopConfig['limit'];
}

export class TransactionDomainError extends Error {
  public readonly code: string;
  public readonly httpStatus: number;

  constructor(code: string, httpStatus: number, message: string) {
    super(message);
    this.name = 'TransactionDomainError';
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

const CATALOG_CACHE_KEY = 'webshop:v1:catalog_bundle';
const CATALOG_ITEMS_CACHE_KEY = 'webshop:v1:catalog_items';
const CATALOG_CATEGORIES_CACHE_KEY = 'webshop:v1:catalog_categories';
const CATALOG_PRICING_CACHE_KEY = 'webshop:v1:catalog_pricing';

export function hashSimulatedBcrypt(password: string): string {
  const digest = crypto
    .createHash('sha256')
    .update(`openmu_salt_${password}`)
    .digest('base64')
    .replace(/[^a-zA-Z0-9./]/g, 'A')
    .slice(0, 53);
  return `$2a$11$${digest}`;
}

export function verifyAccountPassword(
  storedPlainOrHash: string,
  storedHash: string,
  candidatePassword: string
): boolean {
  const candidateHash = hashSimulatedBcrypt(candidatePassword);
  const a = Buffer.from(storedHash);
  const b = Buffer.from(candidateHash);
  if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
    return true;
  }
  const pA = Buffer.from(storedPlainOrHash);
  const pB = Buffer.from(candidatePassword);
  return pA.length === pB.length && crypto.timingSafeEqual(pA, pB);
}

// ============================================================================
// Database Pool Initialization (PostgreSQL on OCI / Docker + Embedded Fallback)
// ============================================================================
const DB_URL = (
  process.env.OPENMU_DATABASE_URL ||
  process.env.DATABASE_URL ||
  ''
).trim();

let pgPool: pg.Pool | null = null;
let pgHealthy = false;

export async function initializeDatabaseLayer(): Promise<void> {
  if (!DB_URL) {
    throw new Error('OPENMU_DATABASE_URL is required. Embedded account and payment storage is disabled.');
  }

  try {
    pgPool = new Pool({
      connectionString: DB_URL,
      max: Number(process.env.DB_POOL_MAX) || 20,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 3_500,
      ssl:
        process.env.DB_SSL === 'true'
          ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
          : undefined,
    });

    pgPool.on('error', (err) => {
      console.error('[Database] Unexpected idle PostgreSQL client error:', err.message);
      pgHealthy = false;
    });

    const client = await pgPool.connect();
    try {
      await bootstrapPostgresSchema(client);
      pgHealthy = true;
      console.info('[Database] PostgreSQL connected & ACID schema verified.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(`[Database] PostgreSQL unavailable (${err instanceof Error ? err.message : err}).`);
    pgHealthy = false;
    throw err;
  }
}

async function bootstrapPostgresSchema(client: pg.PoolClient): Promise<void> {
  await client.query(`
    CREATE SEQUENCE IF NOT EXISTS webshop_item_serial_seq START WITH 1048576 INCREMENT BY 1;

    CREATE TABLE IF NOT EXISTS "MEMB_STAT" (
      "memb___id" VARCHAR(20) PRIMARY KEY,
      "ConnectStat" SMALLINT NOT NULL DEFAULT 0 CHECK ("ConnectStat" IN (0, 1)),
      "ServerName" VARCHAR(50) NOT NULL DEFAULT 'Continent-of-Egis-MU-1',
      "IP" VARCHAR(64) NOT NULL DEFAULT '0.0.0.0',
      "ConnectTM" TIMESTAMPTZ,
      "DisConnectTM" TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS webshop_accounts (
      id UUID PRIMARY KEY,
      login_name VARCHAR(20) UNIQUE NOT NULL,
      password_hash VARCHAR(128) NOT NULL,
      security_code VARCHAR(16) NOT NULL DEFAULT '0000000',
      email VARCHAR(128) NOT NULL,
      state VARCHAR(32) NOT NULL DEFAULT 'Normal',
      role VARCHAR(20) NOT NULL DEFAULT 'USER',
      is_master_admin BOOLEAN NOT NULL DEFAULT FALSE,
      credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0),
      vault_money BIGINT NOT NULL DEFAULT 0 CHECK (vault_money >= 0),
      wcoinc INTEGER NOT NULL DEFAULT 0 CHECK (wcoinc >= 0),
      wcoinp INTEGER NOT NULL DEFAULT 0 CHECK (wcoinp >= 0),
      goblin_points INTEGER NOT NULL DEFAULT 0 CHECK (goblin_points >= 0),
      vip_until TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE webshop_accounts
      ADD COLUMN IF NOT EXISTS security_code VARCHAR(16) NOT NULL DEFAULT '0000000';

    CREATE TABLE IF NOT EXISTS webshop_warehouse_items (
      instance_id VARCHAR(64) PRIMARY KEY,
      account_login VARCHAR(20) NOT NULL REFERENCES webshop_accounts(login_name) ON DELETE CASCADE,
      slot_index SMALLINT NOT NULL CHECK (slot_index >= 0 AND slot_index < 120),
      serial CHAR(8) UNIQUE NOT NULL,
      item_hex CHAR(32) NOT NULL,
      item_uid INTEGER NOT NULL,
      item_id SMALLINT NOT NULL,
      item_type SMALLINT NOT NULL,
      name VARCHAR(120) NOT NULL,
      width SMALLINT NOT NULL CHECK (width BETWEEN 1 AND 8),
      height SMALLINT NOT NULL CHECK (height BETWEEN 1 AND 15),
      item_level SMALLINT NOT NULL DEFAULT 0,
      item_option SMALLINT NOT NULL DEFAULT 0,
      luck BOOLEAN NOT NULL DEFAULT FALSE,
      skill BOOLEAN NOT NULL DEFAULT FALSE,
      exl_mask SMALLINT NOT NULL DEFAULT 0,
      ancient_stamina SMALLINT NOT NULL DEFAULT 0,
      fenrir_variant SMALLINT NOT NULL DEFAULT 0,
      durability SMALLINT NOT NULL DEFAULT 255,
      paid_credits INTEGER NOT NULL DEFAULT 0,
      can_sell_back BOOLEAN NOT NULL DEFAULT TRUE,
      purchased_at BIGINT NOT NULL,
      UNIQUE (account_login, slot_index)
    );

    CREATE TABLE IF NOT EXISTS payment_idempotency_keys (
      idempotency_key VARCHAR(128) PRIMARY KEY,
      reference VARCHAR(128) UNIQUE NOT NULL,
      account_login VARCHAR(20) NOT NULL,
      coin_type VARCHAR(20) NOT NULL,
      coin_amount INTEGER NOT NULL,
      credits_added INTEGER NOT NULL,
      reason VARCHAR(255) NOT NULL,
      client_name VARCHAR(64) NOT NULL,
      response_json JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS webshop_credit_exchanges (
      idempotency_key VARCHAR(128) PRIMARY KEY,
      account_login VARCHAR(20) NOT NULL,
      credits_spent INTEGER NOT NULL CHECK (credits_spent > 0),
      wcoinc_granted INTEGER NOT NULL CHECK (wcoinc_granted > 0),
      status VARCHAR(16) NOT NULL CHECK (status IN ('pending', 'completed')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS webshop_audit_logs (
      id UUID PRIMARY KEY,
      account_id VARCHAR(32) NOT NULL,
      ip_address VARCHAR(64) NOT NULL,
      action VARCHAR(64) NOT NULL,
      status VARCHAR(24) NOT NULL,
      item_hex VARCHAR(512),
      item_serial VARCHAR(16),
      credits_delta INTEGER NOT NULL DEFAULT 0,
      wcoinc_delta INTEGER NOT NULL DEFAULT 0,
      idempotency_key VARCHAR(128),
      details TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_audit_logs_account_created
      ON webshop_audit_logs (LOWER(account_id), created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_serial
      ON webshop_audit_logs (item_serial) WHERE item_serial IS NOT NULL;

    CREATE TABLE IF NOT EXISTS webshop_promotions_config (
      id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      config_json JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const defaultPromo = buildDefaultPromotionConfig();
  await client.query(
    `INSERT INTO webshop_promotions_config (id, config_json, updated_at)
     VALUES (1, $1::jsonb, NOW())
     ON CONFLICT (id) DO NOTHING`,
    [JSON.stringify(defaultPromo)]
  );
  const promoRes = await client.query<{ config_json: PromotionConfig }>(
    `SELECT config_json FROM webshop_promotions_config WHERE id = 1 LIMIT 1`
  );
  if (promoRes.rows[0]?.config_json) {
    memoryPromotionConfig = sanitizePromotionConfig(promoRes.rows[0].config_json);
  }

}

export function getDatabaseHealth(): {
  mode: 'postgresql-acid' | 'embedded-acid';
  postgresConnected: boolean;
} {
  return {
    mode: pgPool && pgHealthy ? 'postgresql-acid' : 'embedded-acid',
    postgresConnected: Boolean(pgPool && pgHealthy),
  };
}

export function getPgPool(): pg.Pool | null {
  return pgPool && pgHealthy ? pgPool : null;
}

export interface AuthenticatedOpenMuAccount {
  id: string;
  loginName: string;
  email: string;
  state: number;
  credits: number;
  wCoinC: number;
  wCoinP: number;
  goblinPoints: number;
}

/** Authenticates against the authoritative OpenMU account table and creates only a webshop wallet row. */
export async function authenticateOpenMuAccount(
  loginName: string,
  password: string
): Promise<AuthenticatedOpenMuAccount | null> {
  if (!pgPool || !pgHealthy) {
    throw new Error('OpenMU database is unavailable.');
  }

  const result = await pgPool.query<{
    Id: string;
    LoginName: string;
    PasswordHash: string;
    EMail: string;
    State: number;
    WCoinC: number;
    WCoinP: number;
    GoblinPoints: number;
  }>(
    `SELECT "Id", "LoginName", "PasswordHash", "EMail", "State", "WCoinC", "WCoinP", "GoblinPoints"
       FROM data."Account"
      WHERE LOWER("LoginName") = LOWER($1)
      LIMIT 1`,
    [loginName]
  );
  const account = result.rows[0];
  if (!account || !(await bcrypt.compare(password, account.PasswordHash))) {
    return null;
  }

  const adminAccounts = new Set(
    (process.env.ADMIN_ACCOUNTS ?? '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean)
  );
  await pgPool.query(
    `INSERT INTO webshop_accounts (
       id, login_name, password_hash, security_code, email, state, role, is_master_admin,
       credits, vault_money, wcoinc, wcoinp, goblin_points
     ) VALUES ($1, $2, '', '', $3, $4, $5, $6, 0, 0, $7, $8, $9)
     ON CONFLICT (login_name) DO UPDATE SET
       email = EXCLUDED.email,
       state = EXCLUDED.state,
       role = EXCLUDED.role,
       is_master_admin = EXCLUDED.is_master_admin,
       wcoinc = EXCLUDED.wcoinc,
       wcoinp = EXCLUDED.wcoinp,
       goblin_points = EXCLUDED.goblin_points,
       updated_at = NOW()`,
    [
      account.Id,
      account.LoginName,
      account.EMail,
      String(account.State),
      adminAccounts.has(account.LoginName.toLowerCase()) ? 'ADMIN' : 'USER',
      adminAccounts.has(account.LoginName.toLowerCase()),
      account.WCoinC,
      account.WCoinP,
      account.GoblinPoints,
    ]
  );
  const wallet = await pgPool.query<{ credits: number }>(
    'SELECT credits FROM webshop_accounts WHERE LOWER(login_name) = LOWER($1) LIMIT 1',
    [account.LoginName]
  );
  return {
    id: account.Id,
    loginName: account.LoginName,
    email: account.EMail,
    state: account.State,
    credits: wallet.rows[0]?.credits ?? 0,
    wCoinC: account.WCoinC,
    wCoinP: account.WCoinP,
    goblinPoints: account.GoblinPoints,
  };
}

export async function getOpenMuAccountSummary(loginName: string): Promise<AuthenticatedOpenMuAccount | null> {
  if (!pgPool || !pgHealthy) throw new Error('OpenMU database is unavailable.');
  const result = await pgPool.query<{
    Id: string; LoginName: string; EMail: string; State: number; WCoinC: number; WCoinP: number; GoblinPoints: number; credits: number;
  }>(
    `SELECT a."Id", a."LoginName", a."EMail", a."State", a."WCoinC", a."WCoinP", a."GoblinPoints", COALESCE(w.credits, 0)::int AS credits
       FROM data."Account" a
       LEFT JOIN webshop_accounts w ON LOWER(w.login_name) = LOWER(a."LoginName")
      WHERE LOWER(a."LoginName") = LOWER($1) LIMIT 1`, [loginName]
  );
  const account = result.rows[0];
  return account ? {
    id: account.Id, loginName: account.LoginName, email: account.EMail, state: account.State,
    credits: account.credits, wCoinC: account.WCoinC, wCoinP: account.WCoinP, goblinPoints: account.GoblinPoints,
  } : null;
}

export async function reserveCreditExchange(loginName: string, credits: number, wCoinC: number, idempotencyKey: string): Promise<'pending' | 'completed'> {
  if (!pgPool || !pgHealthy) throw new Error('OpenMU database is unavailable.');
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query<{ status: 'pending' | 'completed'; account_login: string; credits_spent: number; wcoinc_granted: number }>(
      'SELECT status, account_login, credits_spent, wcoinc_granted FROM webshop_credit_exchanges WHERE idempotency_key = $1 FOR UPDATE', [idempotencyKey]
    );
    if (existing.rows[0]) {
      const row = existing.rows[0];
      if (row.account_login.toLowerCase() !== loginName.toLowerCase() || row.credits_spent !== credits || row.wcoinc_granted !== wCoinC) throw new Error('Idempotency key was already used for a different exchange.');
      await client.query('COMMIT');
      return row.status;
    }
    const wallet = await client.query(
      `UPDATE webshop_accounts SET credits = credits - $1, updated_at = NOW()
        WHERE LOWER(login_name) = LOWER($2) AND credits >= $1 RETURNING login_name`, [credits, loginName]
    );
    if (wallet.rowCount !== 1) throw new TransactionDomainError('INSUFFICIENT_CREDITS', 409, 'Not enough webshop credits.');
    await client.query(
      `INSERT INTO webshop_credit_exchanges (idempotency_key, account_login, credits_spent, wcoinc_granted, status)
       VALUES ($1, $2, $3, $4, 'pending')`, [idempotencyKey, loginName, credits, wCoinC]
    );
    await client.query('COMMIT');
    return 'pending';
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}

export async function completeCreditExchange(idempotencyKey: string): Promise<void> {
  if (!pgPool || !pgHealthy) throw new Error('OpenMU database is unavailable.');
  await pgPool.query(`UPDATE webshop_credit_exchanges SET status = 'completed', completed_at = NOW() WHERE idempotency_key = $1`, [idempotencyKey]);
}

// ============================================================================
// Embedded ACID Store + Per-Account Mutex Lock (Anti-Race / Anti-Dupe)
// ============================================================================
const accountLocks = new Map<string, Promise<void>>();

async function withAccountMutex<T>(accountKey: string, task: () => Promise<T>): Promise<T> {
  const normalized = accountKey.trim().toLowerCase();
  const prev = accountLocks.get(normalized) || Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  const chained = prev.then(() => current);
  accountLocks.set(normalized, chained);

  await prev;
  try {
    return await task();
  } finally {
    release();
    if (accountLocks.get(normalized) === chained) {
      accountLocks.delete(normalized);
    }
  }
}

const memoryAccounts = new Map<string, ServerAccountRecord>();
const memoryMembStat = new Map<string, MembStatRow>();
const memoryGrantsByIdempotency = new Map<string, OpenMuCoinGrant>();
const memoryGrantsByReference = new Map<string, OpenMuCoinGrant>();
const memoryGrantsList: OpenMuCoinGrant[] = [];

let serverCatalog: WebShopItem[] = structuredClone(INITIAL_WEBSHOP_ITEMS);
let serverGroups: ItemGroup[] = structuredClone(INITIAL_GROUPS);
let serverConfig: WebShopConfig = structuredClone(DEFAULT_WEBSHOP_CONFIG);
let catalogVersion = 1;
let memoryPromotionConfig: PromotionConfig = buildDefaultPromotionConfig();

function seedMemoryStore(): void {
  const envAdmin = (process.env.ADMIN_USERNAME || 'admin').trim();
  const envPass = process.env.ADMIN_PASSWORD || 'admin';
  const envDeleteCode = /^\d{4,8}$/.test(process.env.ADMIN_DELETE_CODE || '')
    ? String(process.env.ADMIN_DELETE_CODE)
    : '0000000';

  const initialAccounts: Array<{
    loginName: string;
    password: string;
    securityCode: string;
    state: 'Normal' | 'GameMaster';
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    isMasterAdmin: boolean;
  }> = [
    {
      loginName: envAdmin,
      password: envPass,
      securityCode: envDeleteCode,
      state: 'GameMaster',
      role: 'SUPER_ADMIN',
      isMasterAdmin: true,
    },
    {
      loginName: 'user01',
      password: '123456',
      securityCode: '123456',
      state: 'Normal',
      role: 'USER',
      isMasterAdmin: false,
    },
    {
      loginName: 'admin01',
      password: '123456',
      securityCode: '123456',
      state: 'GameMaster',
      role: 'ADMIN',
      isMasterAdmin: false,
    },
  ];

  const nowIso = new Date().toISOString();
  for (const acc of initialAccounts) {
    const key = acc.loginName.toLowerCase();
    memoryAccounts.set(key, {
      id: crypto.randomUUID(),
      loginName: acc.loginName,
      passwordPlainOrSimulatedBcrypt: acc.password,
      passwordHash: hashSimulatedBcrypt(acc.password),
      securityCode: acc.securityCode,
      email: `${acc.loginName}@egis-mu.com`,
      state: acc.state,
      role: acc.role,
      isMasterAdmin: acc.isMasterAdmin,
      registrationDate: nowIso,
      credits: 0,
      vaultMoney: 0,
      wCoinC: 0,
      wCoinP: 0,
      goblinPoints: 0,
      vipUntil: null,
      vaultItems: [],
    });

    memoryMembStat.set(key, {
      memb___id: acc.loginName,
      ConnectStat: 0,
      ServerName: 'Continent-of-Egis-MU-1',
      IP: '127.0.0.1',
      ConnectTM: null,
      DisConnectTM: nowIso,
    });
  }
}

// Production authentication always uses OpenMU's BCrypt account record.

// ============================================================================
// Redis-Cached Shop Catalog, Categories & Pricing Service
// ============================================================================
export async function getCatalogBundleCached(): Promise<{
  bundle: CachedCatalogBundle;
  cacheHit: boolean;
}> {
  const cached = await cacheGetJson<CachedCatalogBundle>(CATALOG_CACHE_KEY);
  if (cached) {
    return { bundle: cached, cacheHit: true };
  }

  const categories = Object.entries(CATEGORY_NAMES).map(([idStr, names]) => {
    const catId = Number(idStr);
    let activeCount = 0;
    let bannedCount = 0;
    for (const item of serverCatalog) {
      if (item.category === catId) {
        if (item.credits > 0) activeCount += 1;
        else bannedCount += 1;
      }
    }
    return {
      id: catId,
      names,
      activeCount,
      bannedCount,
    };
  });

  const bundle: CachedCatalogBundle = {
    version: catalogVersion,
    generatedAt: new Date().toISOString(),
    items: serverCatalog,
    categories,
    groups: serverGroups,
    pricing: serverConfig.credits,
    limits: serverConfig.limit,
  };

  await Promise.all([
    cacheSetJson(CATALOG_CACHE_KEY, bundle),
    cacheSetJson(CATALOG_ITEMS_CACHE_KEY, bundle.items),
    cacheSetJson(CATALOG_CATEGORIES_CACHE_KEY, bundle.categories),
    cacheSetJson(CATALOG_PRICING_CACHE_KEY, {
      pricing: bundle.pricing,
      limits: bundle.limits,
    }),
  ]);

  return { bundle, cacheHit: false };
}

export async function invalidateCatalogCache(): Promise<void> {
  catalogVersion += 1;
  await cacheDeleteKeys([
    CATALOG_CACHE_KEY,
    CATALOG_ITEMS_CACHE_KEY,
    CATALOG_CATEGORIES_CACHE_KEY,
    CATALOG_PRICING_CACHE_KEY,
  ]);
}

export async function upsertCatalogItem(item: WebShopItem): Promise<WebShopItem> {
  const idx = serverCatalog.findIndex((c) => c.uid === item.uid);
  if (idx >= 0) {
    serverCatalog[idx] = { ...item };
  } else {
    serverCatalog.push({ ...item });
  }
  await invalidateCatalogCache();
  return item;
}

export async function deleteCatalogItem(uid: number): Promise<boolean> {
  const before = serverCatalog.length;
  serverCatalog = serverCatalog.filter((c) => c.uid !== uid);
  if (serverCatalog.length !== before) {
    await invalidateCatalogCache();
    return true;
  }
  return false;
}

export async function upsertCatalogGroup(group: ItemGroup): Promise<ItemGroup> {
  const idx = serverGroups.findIndex((g) => g.id === group.id);
  if (idx >= 0) {
    serverGroups[idx] = { ...group };
  } else {
    serverGroups.push({ ...group });
  }
  await invalidateCatalogCache();
  return group;
}

export async function deleteCatalogGroup(id: number): Promise<boolean> {
  const before = serverGroups.length;
  serverGroups = serverGroups.filter((g) => g.id !== id);
  if (serverGroups.length !== before) {
    await invalidateCatalogCache();
    return true;
  }
  return false;
}

// ============================================================================
// Unified Top-Up & Donation Promotion Configuration (TrueMoney & PayPal Parity)
// ============================================================================
const PROMO_CACHE_KEY = 'webshop:promotions:v1';

export function buildDefaultPromotionConfig(): PromotionConfig {
  const baseCreditsPerThb = 10;
  // Credits are the single paid entitlement. Players may exchange 5 Credits for 1 WCoinC.
  // Avoid granting both currencies for one payment, which would double the advertised value.
  const baseWCoinCPerThb = 0;
  const usdToThbRate = 35;

  const unifiedLadder: Array<{
    amountThb: number;
    bonusPercent: number;
    code: string;
    name: string;
    nameTh: string;
    bonusTextTh: string;
    bonusTextEn: string;
  }> = [
    {
      amountThb: 50,
      bonusPercent: 0,
      code: 'PKG_50',
      name: 'Egis Explorer Pack',
      nameTh: 'แพ็กเกจนักผจญภัย Egis',
      bonusTextTh: 'เรทมาตรฐาน',
      bonusTextEn: 'Standard Rate',
    },
    {
      amountThb: 100,
      bonusPercent: 3,
      code: 'PKG_100',
      name: 'Egis Starter Pack',
      nameTh: 'แพ็กเกจผู้เริ่มต้น Egis',
      bonusTextTh: 'โบนัส +3%',
      bonusTextEn: '+3% Bonus',
    },
    {
      amountThb: 150,
      bonusPercent: 5,
      code: 'PKG_150',
      name: 'Lorencia Vanguard Pack',
      nameTh: 'แพ็กเกจแนวหน้า Lorencia',
      bonusTextTh: 'โบนัส +5%',
      bonusTextEn: '+5% Bonus',
    },
    {
      amountThb: 300,
      bonusPercent: 8,
      code: 'PKG_300',
      name: 'Blade Knight Treasury',
      nameTh: 'แพ็กเกจขุนพล Blade Knight',
      bonusTextTh: 'โบนัส +8%',
      bonusTextEn: '+8% Bonus',
    },
    {
      amountThb: 500,
      bonusPercent: 10,
      code: 'PKG_500',
      name: 'Icarus Sky Sovereign',
      nameTh: 'แพ็กเกจเจ้าเวหา Icarus',
      bonusTextTh: 'ยอดนิยม · โบนัส +10%',
      bonusTextEn: 'Popular · +10% Bonus',
    },
    {
      amountThb: 1000,
      bonusPercent: 15,
      code: 'PKG_1000',
      name: 'Kundun Conqueror Chest',
      nameTh: 'แพ็กเกจผู้พิชิต Kundun',
      bonusTextTh: 'คุ้มค่าสูงสุด · โบนัส +15%',
      bonusTextEn: 'Best Value · +15% Bonus',
    },
  ];

  const trueMoneyTiers: TrueMoneyPromoTier[] = unifiedLadder.map((row) => ({
    amountThb: row.amountThb,
    bonusPercent: row.bonusPercent,
    credits: Math.round(row.amountThb * baseCreditsPerThb * (1 + row.bonusPercent / 100)),
    wCoinC: Math.round(row.amountThb * baseWCoinCPerThb * (1 + row.bonusPercent / 100)),
    bonusText: row.bonusTextTh,
    bonusTextEn: row.bonusTextEn,
    enabled: true,
  }));

  const payPalPackages: PayPalPromoPackage[] = unifiedLadder.map((row) => ({
    code: row.code,
    name: row.name,
    nameTh: row.nameTh,
    priceThb: row.amountThb,
    priceUsd: Number((row.amountThb / usdToThbRate).toFixed(2)),
    bonusPercent: row.bonusPercent,
    credits: Math.round(row.amountThb * baseCreditsPerThb * (1 + row.bonusPercent / 100)),
    wCoinC: Math.round(row.amountThb * baseWCoinCPerThb * (1 + row.bonusPercent / 100)),
    bonusTag: row.bonusTextEn,
    bonusTagTh: row.bonusTextTh,
    enabled: true,
  }));

  return {
    campaignActive: false,
    campaignTitleTh: 'โปรโมชั่นเติมเงินพิเศษ รับโบนัสเพิ่มทุกช่องทาง (TrueMoney & PayPal)',
    campaignTitleEn: 'Special Top-Up Event: Extra Bonus Across TrueMoney & PayPal',
    extraBonusPercent: 0,
    baseCreditsPerThb,
    baseWCoinCPerThb,
    usdToThbRate,
    merchantPhone: process.env.TRUEMONEY_MERCHANT_PHONE || '',
    trueMoneyTiers,
    payPalPackages,
    updatedAt: new Date().toISOString(),
    updatedBy: 'system',
  };
}

function sanitizePromotionConfig(
  raw: Partial<PromotionConfig>,
  updatedBy?: string
): PromotionConfig {
  const defaults = buildDefaultPromotionConfig();
  const baseCreditsPerThb = Math.max(
    1,
    Math.min(1000, Number(raw.baseCreditsPerThb) || defaults.baseCreditsPerThb)
  );
  const baseWCoinCPerThb = Math.max(
    0,
    Math.min(1000, Number(raw.baseWCoinCPerThb ?? defaults.baseWCoinCPerThb))
  );
  const usdToThbRate = Math.max(
    1,
    Math.min(200, Number(raw.usdToThbRate) || defaults.usdToThbRate)
  );
  const extraBonusPercent = Math.max(
    0,
    Math.min(300, Math.round(Number(raw.extraBonusPercent) || 0))
  );

  const trueMoneyTiers: TrueMoneyPromoTier[] =
    Array.isArray(raw.trueMoneyTiers) && raw.trueMoneyTiers.length > 0
      ? raw.trueMoneyTiers
          .map((t) => {
            const amountThb = Math.max(1, Math.round(Number(t.amountThb) || 50));
            const bonusPercent = Math.max(
              0,
              Math.min(500, Math.round(Number(t.bonusPercent) || 0))
            );
            const credits = Math.max(1, Math.round(Number(t.credits) || amountThb * baseCreditsPerThb));
            const wCoinC = Math.max(0, Math.round(Number(t.wCoinC) || 0));
            return {
              amountThb,
              bonusPercent,
              credits,
              wCoinC,
              bonusText:
                String(t.bonusText || '').trim() ||
                (bonusPercent > 0 ? `โบนัส +${bonusPercent}%` : 'เรทมาตรฐาน'),
              bonusTextEn:
                String(t.bonusTextEn || '').trim() ||
                (bonusPercent > 0 ? `+${bonusPercent}% Bonus` : 'Standard Rate'),
              enabled: t.enabled !== false,
            };
          })
          .sort((a, b) => a.amountThb - b.amountThb)
      : defaults.trueMoneyTiers;

  const payPalPackages: PayPalPromoPackage[] =
    Array.isArray(raw.payPalPackages) && raw.payPalPackages.length > 0
      ? raw.payPalPackages.map((p, idx) => {
          const priceThb = Math.max(1, Math.round(Number(p.priceThb) || 100));
          const priceUsd = Math.max(
            0.5,
            Number((Number(p.priceUsd) || priceThb / usdToThbRate).toFixed(2))
          );
          const bonusPercent = Math.max(
            0,
            Math.min(500, Math.round(Number(p.bonusPercent) || 0))
          );
          const credits = Math.max(
            1,
            Math.round(Number(p.credits) || priceThb * baseCreditsPerThb)
          );
          const wCoinC = Math.max(0, Math.round(Number(p.wCoinC) || 0));
          const cleanCode =
            String(p.code || `PKG_${priceThb}_${idx + 1}`)
              .trim()
              .replace(/[^a-zA-Z0-9_-]/g, '_')
              .toUpperCase() || `PKG_${idx + 1}`;
          return {
            code: cleanCode,
            name: String(p.name || `Egis Pack ${priceThb} THB`).trim(),
            nameTh: String(p.nameTh || `แพ็กเกจ Egis ${priceThb} บาท`).trim(),
            priceUsd,
            priceThb,
            bonusPercent,
            credits,
            wCoinC,
            bonusTag:
              String(p.bonusTag || '').trim() ||
              (bonusPercent > 0 ? `+${bonusPercent}% Bonus` : 'Standard Rate'),
            bonusTagTh:
              String(p.bonusTagTh || '').trim() ||
              (bonusPercent > 0 ? `โบนัส +${bonusPercent}%` : 'เรทมาตรฐาน'),
            enabled: p.enabled !== false,
          };
        })
      : defaults.payPalPackages;

  return {
    campaignActive: Boolean(raw.campaignActive),
    campaignTitleTh:
      String(raw.campaignTitleTh || '').trim() || defaults.campaignTitleTh,
    campaignTitleEn:
      String(raw.campaignTitleEn || '').trim() || defaults.campaignTitleEn,
    extraBonusPercent,
    baseCreditsPerThb,
    baseWCoinCPerThb,
    usdToThbRate,
    merchantPhone: String(raw.merchantPhone ?? defaults.merchantPhone).trim(),
    trueMoneyTiers,
    payPalPackages,
    updatedAt: new Date().toISOString(),
    updatedBy: updatedBy || raw.updatedBy || 'admin',
  };
}

export function getPromotionConfig(): PromotionConfig {
  return structuredClone(memoryPromotionConfig);
}

export function getEffectivePromotions(): {
  config: PromotionConfig;
  effectiveTrueMoneyTiers: Array<
    TrueMoneyPromoTier & { baseCredits: number; baseWCoinC: number }
  >;
  effectivePayPalPackages: Array<
    PayPalPromoPackage & { baseCredits: number; baseWCoinC: number }
  >;
} {
  const cfg = getPromotionConfig();
  const mult =
    cfg.campaignActive && cfg.extraBonusPercent > 0
      ? 1 + cfg.extraBonusPercent / 100
      : 1;

  const effectiveTrueMoneyTiers = cfg.trueMoneyTiers
    .filter((t) => t.enabled !== false)
    .map((t) => ({
      ...t,
      baseCredits: t.credits,
      baseWCoinC: t.wCoinC,
      credits: Math.round(t.credits * mult),
      wCoinC: Math.round(t.wCoinC * mult),
    }));

  const effectivePayPalPackages = cfg.payPalPackages
    .filter((p) => p.enabled !== false)
    .map((p) => ({
      ...p,
      baseCredits: p.credits,
      baseWCoinC: p.wCoinC,
      credits: Math.round(p.credits * mult),
      wCoinC: Math.round(p.wCoinC * mult),
    }));

  return {
    config: cfg,
    effectiveTrueMoneyTiers,
    effectivePayPalPackages,
  };
}

export async function updatePromotionConfig(
  patch: Partial<PromotionConfig>,
  updatedBy = 'admin'
): Promise<PromotionConfig> {
  const merged = sanitizePromotionConfig(
    {
      ...memoryPromotionConfig,
      ...patch,
    },
    updatedBy
  );
  memoryPromotionConfig = merged;

  if (pgPool && pgHealthy) {
    await pgPool.query(
      `INSERT INTO webshop_promotions_config (id, config_json, updated_at)
       VALUES (1, $1::jsonb, NOW())
       ON CONFLICT (id)
       DO UPDATE SET config_json = EXCLUDED.config_json, updated_at = NOW()`,
      [JSON.stringify(merged)]
    );
  }

  await cacheDeleteKeys([PROMO_CACHE_KEY]);
  return structuredClone(memoryPromotionConfig);
}

export async function resetPromotionConfigToDefault(
  updatedBy = 'admin'
): Promise<PromotionConfig> {
  const reset = sanitizePromotionConfig(buildDefaultPromotionConfig(), updatedBy);
  memoryPromotionConfig = reset;

  if (pgPool && pgHealthy) {
    await pgPool.query(
      `INSERT INTO webshop_promotions_config (id, config_json, updated_at)
       VALUES (1, $1::jsonb, NOW())
       ON CONFLICT (id)
       DO UPDATE SET config_json = EXCLUDED.config_json, updated_at = NOW()`,
      [JSON.stringify(reset)]
    );
  }

  await cacheDeleteKeys([PROMO_CACHE_KEY]);
  return structuredClone(memoryPromotionConfig);
}

// ============================================================================
// MEMB_STAT Online Status Check & Sync
// ============================================================================
export async function queryMembStatOnlineStatus(loginName: string): Promise<MembStatRow> {
  const key = loginName.trim().toLowerCase();

  if (pgPool && pgHealthy) {
    const { rows } = await pgPool.query<{
      memb___id: string;
      ConnectStat: number;
      ServerName: string;
      IP: string;
      ConnectTM: Date | null;
      DisConnectTM: Date | null;
    }>(
      `SELECT "memb___id", "ConnectStat", "ServerName", "IP", "ConnectTM", "DisConnectTM"
       FROM "MEMB_STAT"
       WHERE LOWER("memb___id") = LOWER($1)
       LIMIT 1`,
      [loginName.trim()]
    );
    if (rows[0]) {
      return {
        memb___id: rows[0].memb___id,
        ConnectStat: rows[0].ConnectStat === 1 ? 1 : 0,
        ServerName: rows[0].ServerName,
        IP: rows[0].IP,
        ConnectTM: rows[0].ConnectTM ? rows[0].ConnectTM.toISOString() : null,
        DisConnectTM: rows[0].DisConnectTM ? rows[0].DisConnectTM.toISOString() : null,
      };
    }
  }

  return (
    memoryMembStat.get(key) || {
      memb___id: loginName.trim(),
      ConnectStat: 0,
      ServerName: 'Offline',
      IP: '0.0.0.0',
      ConnectTM: null,
      DisConnectTM: null,
    }
  );
}

export async function setMembStatConnectionState(
  loginName: string,
  connectStat: 0 | 1,
  ipAddress: string,
  serverName = 'Continent-of-Lorencia-1'
): Promise<MembStatRow> {
  const clean = loginName.trim();
  const key = clean.toLowerCase();
  const nowIso = new Date().toISOString();

  const updated: MembStatRow = {
    memb___id: clean,
    ConnectStat: connectStat,
    ServerName: serverName,
    IP: ipAddress,
    ConnectTM: connectStat === 1 ? nowIso : memoryMembStat.get(key)?.ConnectTM || null,
    DisConnectTM: connectStat === 0 ? nowIso : memoryMembStat.get(key)?.DisConnectTM || null,
  };
  memoryMembStat.set(key, updated);

  if (pgPool && pgHealthy) {
    await pgPool.query(
      `INSERT INTO "MEMB_STAT" ("memb___id", "ConnectStat", "ServerName", "IP", "ConnectTM", "DisConnectTM")
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT ("memb___id") DO UPDATE SET
         "ConnectStat" = EXCLUDED."ConnectStat",
         "ServerName" = EXCLUDED."ServerName",
         "IP" = EXCLUDED."IP",
         "ConnectTM" = EXCLUDED."ConnectTM",
         "DisConnectTM" = EXCLUDED."DisConnectTM"`,
      [clean, connectStat, serverName, ipAddress, updated.ConnectTM, updated.DisConnectTM]
    );
  }

  return updated;
}

// ============================================================================
// Account Lookup & Registration Helpers
// ============================================================================
export function getMemoryAccount(loginName: string): ServerAccountRecord | null {
  return memoryAccounts.get(loginName.trim().toLowerCase()) || null;
}

export function getRecentCoinGrants(limit = 25, loginName?: string): OpenMuCoinGrant[] {
  if (!loginName) return memoryGrantsList.slice(0, limit);
  const lower = loginName.toLowerCase();
  return memoryGrantsList
    .filter((g) => g.accountLoginName.toLowerCase() === lower)
    .slice(0, limit);
}

export async function registerAccountRecord(
  loginName: string,
  password: string,
  email: string,
  characterDeleteCode: string,
  ipAddress: string
): Promise<ServerAccountRecord> {
  const cleanName = loginName.trim();
  const key = cleanName.toLowerCase();
  const cleanDeleteCode = (characterDeleteCode || '').trim();

  if (!/^\d{4,8}$/.test(cleanDeleteCode)) {
    throw new TransactionDomainError(
      'INVALID_DELETE_CODE',
      400,
      'รหัสสำหรับลบตัวละครต้องเป็นตัวเลขเท่านั้น (ความยาว 4–8 หลัก)'
    );
  }

  if (memoryAccounts.has(key)) {
    throw new TransactionDomainError(
      'ACCOUNT_EXISTS',
      409,
      `ชื่อบัญชี "${cleanName}" มีอยู่ในระบบ data."Account" แล้ว (409 Conflict)`
    );
  }

  const passwordHash = hashSimulatedBcrypt(password);
  const newAcc: ServerAccountRecord = {
    id: crypto.randomUUID(),
    loginName: cleanName,
    passwordPlainOrSimulatedBcrypt: password,
    passwordHash,
    securityCode: cleanDeleteCode,
    email: email || `${cleanName}@egis-mu.com`,
    state: 'Normal',
    role: 'USER',
    isMasterAdmin: false,
    registrationDate: new Date().toISOString(),
    credits: 0,
    vaultMoney: 0,
    wCoinC: 0,
    wCoinP: 0,
    goblinPoints: 0,
    vipUntil: null,
    vaultItems: [],
  };

  if (pgPool && pgHealthy) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO webshop_accounts (
          id, login_name, password_hash, security_code, email, state, role, is_master_admin,
          credits, vault_money, wcoinc, wcoinp, goblin_points
        ) VALUES ($1, $2, $3, $4, $5, 'Normal', 'USER', FALSE, 0, 0, 0, 0, 0)`,
        [newAcc.id, cleanName, passwordHash, cleanDeleteCode, newAcc.email]
      );
      await client.query(
        `INSERT INTO "MEMB_STAT" ("memb___id", "ConnectStat", "ServerName", "IP")
         VALUES ($1, 0, 'Offline', $2)
         ON CONFLICT ("memb___id") DO NOTHING`,
        [cleanName, ipAddress]
      );
      await recordAuditLog(
        {
          accountId: cleanName,
          ipAddress,
          action: 'ACCOUNT_REGISTER',
          status: 'COMMITTED',
          details: `Registered new account "${cleanName}" (numeric Character Delete Code configured)`,
        },
        client
      );
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } else {
    await recordAuditLog({
      accountId: cleanName,
      ipAddress,
      action: 'ACCOUNT_REGISTER',
      status: 'COMMITTED',
      details: `Registered new account "${cleanName}" (numeric Character Delete Code configured)`,
    });
  }

  memoryAccounts.set(key, newAcc);
  memoryMembStat.set(key, {
    memb___id: cleanName,
    ConnectStat: 0,
    ServerName: 'Offline',
    IP: ipAddress,
    ConnectTM: null,
    DisConnectTM: new Date().toISOString(),
  });

  return newAcc;
}

// ============================================================================
// STRICT ACID PURCHASE TRANSACTIONS (Anti-Dupe + MEMB_STAT Check + Rollback)
// ============================================================================
export interface PurchaseSingleItemRequest {
  accountId: string;
  ipAddress: string;
  idempotencyKey?: string;
  currency?: 'credits' | 'WCoinC';
  clientCurrentCredits?: number;
  clientVaultItems?: VaultItemInstance[];
  itemUid: number;
  level: number;
  option: number;
  luck: boolean;
  skill: boolean;
  exlOptions: boolean[];
  ancientStamina: 0 | 5 | 10;
  fenrirVariant: 0 | 1 | 2 | 3;
}

export interface PurchaseTransactionResult {
  ok: true;
  idempotentReplay?: boolean;
  chargedCredits: number;
  chargedWCoinC: number;
  remainingCredits: number;
  remainingWCoinC: number;
  addedItems: VaultItemInstance[];
  warehouseHex3840: string;
  message: string;
}

export async function executePurchaseSingleItemTx(
  req: PurchaseSingleItemRequest
): Promise<PurchaseTransactionResult> {
  const cleanAccount = (req.accountId || '').trim();
  if (!cleanAccount) {
    throw new TransactionDomainError('INVALID_ACCOUNT', 400, 'Account ID is required.');
  }

  const idemKey = req.idempotencyKey?.trim();
  if (idemKey) {
    const claim = await claimIdempotencyKey('purchase', `${cleanAccount}:${idemKey}`, 3600);
    if (claim.state === 'COMPLETED') {
      return {
        ...(claim.cachedResponse as PurchaseTransactionResult),
        idempotentReplay: true,
      };
    }
    if (claim.state === 'IN_PROGRESS') {
      throw new TransactionDomainError(
        'DUPLICATE_IN_FLIGHT',
        409,
        'Duplicate purchase request is currently being processed. Please wait.'
      );
    }
  }

  try {
    const { bundle } = await getCatalogBundleCached();
    const catalogItem = bundle.items.find((it) => it.uid === Number(req.itemUid));
    if (!catalogItem) {
      throw new TransactionDomainError(
        'ITEM_NOT_FOUND',
        404,
        `Catalog item UID #${req.itemUid} does not exist.`
      );
    }

    const sanitized = sanitizeAndPriceSingleItem(
      catalogItem,
      {
        level: req.level,
        option: req.option,
        luck: req.luck,
        skill: req.skill,
        exlOptions: req.exlOptions,
        ancientStamina: req.ancientStamina,
        fenrirVariant: req.fenrirVariant,
      },
      serverConfig
    );

    const useWCoin = req.currency === 'WCoinC';
    const requiredCredits = useWCoin ? 0 : sanitized.totalCredits;
    const requiredWCoinC = useWCoin ? sanitized.totalCredits : 0;

    // Branch A: PostgreSQL SERIALIZABLE ACID Transaction
    if (pgPool && pgHealthy) {
      const client = await pgPool.connect();
      try {
        await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

        // Step 1: Lock & Check MEMB_STAT (Online Anti-Dupe Guard)
        const membRes = await client.query<{ ConnectStat: number; ServerName: string }>(
          `SELECT "ConnectStat", "ServerName"
           FROM "MEMB_STAT"
           WHERE LOWER("memb___id") = LOWER($1)
           FOR SHARE`,
          [cleanAccount]
        );
        if (membRes.rows[0]?.ConnectStat === 1) {
          throw new TransactionDomainError(
            'ACCOUNT_ONLINE_MEMB_STAT',
            409,
            `Rejected by MEMB_STAT Anti-Dupe Guard: Account "${cleanAccount}" is currently online (${membRes.rows[0].ServerName}, ConnectStat = 1). Please log out completely before purchasing items.`
          );
        }

        // Step 2: Lock Account Row FOR UPDATE & Verify Balance
        const accRes = await client.query<{
          login_name: string;
          credits: number;
          wcoinc: number;
        }>(
          `SELECT login_name, credits, wcoinc
           FROM webshop_accounts
           WHERE LOWER(login_name) = LOWER($1)
           FOR UPDATE`,
          [cleanAccount]
        );
        const dbAcc = accRes.rows[0];
        if (!dbAcc) {
          throw new TransactionDomainError('ACCOUNT_NOT_FOUND', 404, 'Account not found.');
        }

        if (useWCoin && dbAcc.wcoinc < requiredWCoinC) {
          throw new TransactionDomainError(
            'INSUFFICIENT_WCOINC',
            402,
            `Insufficient WCoinC balance (need ${requiredWCoinC}, have ${dbAcc.wcoinc}).`
          );
        }
        if (!useWCoin && dbAcc.credits < requiredCredits) {
          throw new TransactionDomainError(
            'INSUFFICIENT_CREDITS',
            402,
            'You do not have enough credits to do that.'
          );
        }

        // Step 3: Lock Warehouse Items FOR UPDATE & Locate Non-Overlapping Slot
        const whRes = await client.query<{
          instance_id: string;
          slot_index: number;
          serial: string;
          item_hex: string;
          item_uid: number;
          item_id: number;
          item_type: number;
          name: string;
          width: number;
          height: number;
          item_level: number;
          item_option: number;
          luck: boolean;
          skill: boolean;
          exl_mask: number;
          ancient_stamina: number;
          fenrir_variant: number;
          durability: number;
          paid_credits: number;
          can_sell_back: boolean;
          purchased_at: string;
        }>(
          `SELECT * FROM webshop_warehouse_items
           WHERE LOWER(account_login) = LOWER($1)
           FOR UPDATE`,
          [dbAcc.login_name]
        );

        const currentVault: VaultItemInstance[] = whRes.rows.map((r) => ({
          instanceId: r.instance_id,
          serial: r.serial,
          itemHex: r.item_hex,
          slotIndex: r.slot_index,
          itemUid: r.item_uid,
          itemId: r.item_id,
          itemType: r.item_type,
          name: r.name,
          X: r.width,
          Y: r.height,
          level: r.item_level,
          option: r.item_option,
          luck: r.luck,
          skill: r.skill,
          exlOptions: Array.from({ length: 6 }, (_, i) => Boolean(r.exl_mask & (1 << i))),
          ancientStamina: (r.ancient_stamina === 5 || r.ancient_stamina === 10
            ? r.ancient_stamina
            : 0) as 0 | 5 | 10,
          fenrirVariant: (r.fenrir_variant >= 0 && r.fenrir_variant <= 3
            ? r.fenrir_variant
            : 0) as 0 | 1 | 2 | 3,
          durability: r.durability,
          paidCredits: r.paid_credits,
          canSellBack: r.can_sell_back,
          purchasedAt: Number(r.purchased_at),
        }));

        const freeSlot = locateFreeWarehouseSlot(currentVault, catalogItem.X, catalogItem.Y);
        if (
          freeSlot === 1337 ||
          !verifySlotPlacement(currentVault, freeSlot, catalogItem.X, catalogItem.Y)
        ) {
          throw new TransactionDomainError(
            'WAREHOUSE_FULL',
            409,
            'You do not have free slots in your vault to add this item.'
          );
        }

        // Step 4: Generate DB Sequence Serial + Season 6 32-Hex Item Payload
        const seqRes = await client.query<{ seq: string }>(
          `SELECT nextval('webshop_item_serial_seq') AS seq`
        );
        const seqNum = (Number(seqRes.rows[0].seq) & 0xffffffff) >>> 0 || 1;
        const serial = seqNum.toString(16).toUpperCase().padStart(8, '0');

        const itemHex = encodeSeason6ItemHex({
          itemId: catalogItem.id,
          itemType: catalogItem.type,
          level: sanitized.level,
          option: sanitized.option,
          luck: sanitized.luck,
          skill: sanitized.skill,
          durability: 255,
          serial,
          exlOptions: sanitized.exlOptions,
          ancientStamina: sanitized.ancientStamina,
          fenrirVariant: sanitized.fenrirVariant,
        });

        // Step 5: Deduct Currency with Guarded Check
        const deductRes = await client.query<{ credits: number; wcoinc: number }>(
          `UPDATE webshop_accounts
           SET credits = credits - $1,
               wcoinc = wcoinc - $2,
               updated_at = NOW()
           WHERE login_name = $3
             AND credits >= $1
             AND wcoinc >= $2
           RETURNING credits, wcoinc`,
          [requiredCredits, requiredWCoinC, dbAcc.login_name]
        );
        if (deductRes.rowCount !== 1) {
          throw new TransactionDomainError(
            'BALANCE_RACE_ABORTED',
            409,
            'Concurrent balance update detected; transaction rolled back.'
          );
        }

        // Step 6: Insert Warehouse Item (Protected by UNIQUE(account_login, slot_index) & UNIQUE(serial))
        const purchasedAt = Math.floor(Date.now() / 1000);
        const instanceId = `${serial}_${Date.now()}`;
        const exlMask = sanitized.exlOptions.reduce(
          (acc, on, idx) => (on ? acc | (1 << idx) : acc),
          0
        );

        await client.query(
          `INSERT INTO webshop_warehouse_items (
            instance_id, account_login, slot_index, serial, item_hex,
            item_uid, item_id, item_type, name, width, height,
            item_level, item_option, luck, skill, exl_mask,
            ancient_stamina, fenrir_variant, durability, paid_credits,
            can_sell_back, purchased_at
          ) VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10, $11,
            $12, $13, $14, $15, $16,
            $17, $18, 255, $19,
            $20, $21
          )`,
          [
            instanceId,
            dbAcc.login_name,
            freeSlot,
            serial,
            itemHex,
            catalogItem.uid,
            catalogItem.id,
            catalogItem.type,
            catalogItem.name,
            catalogItem.X,
            catalogItem.Y,
            sanitized.level,
            sanitized.option,
            sanitized.luck,
            sanitized.skill,
            exlMask,
            sanitized.ancientStamina,
            sanitized.fenrirVariant,
            sanitized.totalCredits,
            catalogItem.cansellitem === 1,
            purchasedAt,
          ]
        );

        const newInstance: VaultItemInstance = {
          instanceId,
          serial,
          itemHex,
          slotIndex: freeSlot,
          itemUid: catalogItem.uid,
          itemId: catalogItem.id,
          itemType: catalogItem.type,
          name: catalogItem.name,
          X: catalogItem.X,
          Y: catalogItem.Y,
          level: sanitized.level,
          option: sanitized.option,
          luck: sanitized.luck,
          skill: sanitized.skill,
          exlOptions: sanitized.exlOptions,
          ancientStamina: sanitized.ancientStamina,
          fenrirVariant: sanitized.fenrirVariant,
          durability: 255,
          paidCredits: sanitized.totalCredits,
          canSellBack: catalogItem.cansellitem === 1,
          purchasedAt,
        };

        // Step 7: Transactional Audit Log + COMMIT
        await recordAuditLog(
          {
            accountId: dbAcc.login_name,
            ipAddress: req.ipAddress,
            action: 'PURCHASE_SINGLE_ITEM',
            status: 'COMMITTED',
            itemHex,
            itemSerial: serial,
            creditsDelta: -requiredCredits,
            wCoinCDelta: -requiredWCoinC,
            idempotencyKey: idemKey || null,
            details: `Bought ${
              sanitized.exlOptions.some(Boolean) ? 'Excellent ' : ''
            }${catalogItem.name}${
              sanitized.level > 0 ? ` +${sanitized.level}` : ''
            } [Slot #${freeSlot}, Serial: ${serial}, Hex: ${itemHex}] for ${
              sanitized.totalCredits
            } ${useWCoin ? 'WCoinC' : 'credits'}`,
          },
          client
        );

        await client.query('COMMIT');

        const updatedVault = [...currentVault, newInstance];
        const responsePayload: PurchaseTransactionResult = {
          ok: true,
          chargedCredits: requiredCredits,
          chargedWCoinC: requiredWCoinC,
          remainingCredits: deductRes.rows[0].credits,
          remainingWCoinC: deductRes.rows[0].wcoinc,
          addedItems: [newInstance],
          warehouseHex3840: encodeWarehouseHex3840(updatedVault),
          message: `Successfully added ${catalogItem.name} (Serial: ${serial}) to Vault Slot #${freeSlot} (Col ${
            (freeSlot % 8) + 1
          }, Row ${Math.floor(freeSlot / 8) + 1})! Charged ${sanitized.totalCredits.toLocaleString()} ${
            useWCoin ? 'WCoinC' : 'credits'
          }.`,
        };

        if (idemKey) {
          await finalizeIdempotencyKey(
            'purchase',
            `${cleanAccount}:${idemKey}`,
            responsePayload,
            3600
          );
        }
        return responsePayload;
      } catch (txErr) {
        await client.query('ROLLBACK').catch(() => {});
        throw txErr;
      } finally {
        client.release();
      }
    }

    // Branch B: Embedded ACID Store with Per-Account Mutex & Snapshot Rollback
    return await withAccountMutex(cleanAccount, async () => {
      const key = cleanAccount.toLowerCase();
      const memAcc = memoryAccounts.get(key);
      if (!memAcc) {
        throw new TransactionDomainError(
          'ACCOUNT_NOT_FOUND',
          404,
          'Account not found. Please sign in first.'
        );
      }
      // Keep embedded state synchronized if client adjusted credits/items via local modules
      if (
        typeof req.clientCurrentCredits === 'number' &&
        Number.isFinite(req.clientCurrentCredits) &&
        req.clientCurrentCredits >= 0
      ) {
        memAcc.credits = Math.trunc(req.clientCurrentCredits);
      }
      if (Array.isArray(req.clientVaultItems)) {
        memAcc.vaultItems = structuredClone(req.clientVaultItems);
      }

      // Snapshot before transaction for strict ACID Rollback guarantee
      const snapshot = structuredClone(memAcc);

      try {
        // Step 1: Query MEMB_STAT Online Status (ConnectStat = 1 -> Reject!)
        const stat = memoryMembStat.get(key);
        if (stat && stat.ConnectStat === 1) {
          throw new TransactionDomainError(
            'ACCOUNT_ONLINE_MEMB_STAT',
            409,
            `Rejected by MEMB_STAT Anti-Dupe Guard: Account "${memAcc.loginName}" is currently online (${stat.ServerName}, ConnectStat = 1). Please log out completely before adding items to the vault.`
          );
        }

        // Step 2: Check Balance
        if (useWCoin && memAcc.wCoinC < requiredWCoinC) {
          throw new TransactionDomainError(
            'INSUFFICIENT_WCOINC',
            402,
            `You do not have enough WCoinC (need ${requiredWCoinC}, have ${memAcc.wCoinC}).`
          );
        }
        if (!useWCoin && memAcc.credits < requiredCredits) {
          throw new TransactionDomainError(
            'INSUFFICIENT_CREDITS',
            402,
            'You do not have enough credits to do that.'
          );
        }

        // Step 3: Locate Non-Overlapping 8x15 Warehouse Slot
        const freeSlot = locateFreeWarehouseSlot(
          memAcc.vaultItems,
          catalogItem.X,
          catalogItem.Y
        );
        if (
          freeSlot === 1337 ||
          !verifySlotPlacement(memAcc.vaultItems, freeSlot, catalogItem.X, catalogItem.Y)
        ) {
          throw new TransactionDomainError(
            'WAREHOUSE_FULL',
            409,
            'You do not have free slots in your vault to add this item.'
          );
        }

        // Step 4: Generate Unique Serial + Season 6 32-Hex Item Payload
        const serial = generateUniqueItemSerial();
        const itemHex = encodeSeason6ItemHex({
          itemId: catalogItem.id,
          itemType: catalogItem.type,
          level: sanitized.level,
          option: sanitized.option,
          luck: sanitized.luck,
          skill: sanitized.skill,
          durability: 255,
          serial,
          exlOptions: sanitized.exlOptions,
          ancientStamina: sanitized.ancientStamina,
          fenrirVariant: sanitized.fenrirVariant,
        });

        const newInstance: VaultItemInstance = {
          instanceId: `${serial}_${Date.now()}`,
          serial,
          itemHex,
          slotIndex: freeSlot,
          itemUid: catalogItem.uid,
          itemId: catalogItem.id,
          itemType: catalogItem.type,
          name: catalogItem.name,
          X: catalogItem.X,
          Y: catalogItem.Y,
          level: sanitized.level,
          option: sanitized.option,
          luck: sanitized.luck,
          skill: sanitized.skill,
          exlOptions: sanitized.exlOptions,
          ancientStamina: sanitized.ancientStamina,
          fenrirVariant: sanitized.fenrirVariant,
          durability: 255,
          paidCredits: sanitized.totalCredits,
          canSellBack: catalogItem.cansellitem === 1,
          purchasedAt: Math.floor(Date.now() / 1000),
        };

        // Step 5: Mutate inside transaction boundary & COMMIT atomically
        memAcc.credits -= requiredCredits;
        memAcc.wCoinC -= requiredWCoinC;
        memAcc.vaultItems.push(newInstance);

        await recordAuditLog({
          accountId: memAcc.loginName,
          ipAddress: req.ipAddress,
          action: 'PURCHASE_SINGLE_ITEM',
          status: 'COMMITTED',
          itemHex,
          itemSerial: serial,
          creditsDelta: -requiredCredits,
          wCoinCDelta: -requiredWCoinC,
          idempotencyKey: idemKey || null,
          details: `Bought ${
            sanitized.exlOptions.some(Boolean) ? 'Excellent ' : ''
          }${catalogItem.name}${
            sanitized.level > 0 ? ` +${sanitized.level}` : ''
          } [Slot #${freeSlot}, Serial: ${serial}, Hex: ${itemHex}] for ${
            sanitized.totalCredits
          } ${useWCoin ? 'WCoinC' : 'credits'}`,
        });

        const responsePayload: PurchaseTransactionResult = {
          ok: true,
          chargedCredits: requiredCredits,
          chargedWCoinC: requiredWCoinC,
          remainingCredits: memAcc.credits,
          remainingWCoinC: memAcc.wCoinC,
          addedItems: [newInstance],
          warehouseHex3840: encodeWarehouseHex3840(memAcc.vaultItems),
          message: `Successfully added ${catalogItem.name} (Serial: ${serial}) to Vault Slot #${freeSlot} (Col ${
            (freeSlot % 8) + 1
          }, Row ${Math.floor(freeSlot / 8) + 1})! Charged ${sanitized.totalCredits.toLocaleString()} ${
            useWCoin ? 'WCoinC' : 'credits'
          }.`,
        };

        if (idemKey) {
          await finalizeIdempotencyKey(
            'purchase',
            `${cleanAccount}:${idemKey}`,
            responsePayload,
            3600
          );
        }
        return responsePayload;
      } catch (innerErr) {
        // Strict Rollback: Restore exact pre-transaction account & warehouse snapshot
        memoryAccounts.set(key, snapshot);
        throw innerErr;
      }
    });
  } catch (err) {
    if (idemKey) {
      await releaseIdempotencyKey('purchase', `${cleanAccount}:${idemKey}`);
    }

    const statusLabel =
      err instanceof TransactionDomainError ? 'REJECTED' : 'ROLLED_BACK';
    await recordAuditLog(
      {
        accountId: cleanAccount,
        ipAddress: req.ipAddress,
        action: 'PURCHASE_SINGLE_ITEM',
        status: statusLabel,
        idempotencyKey: idemKey || null,
        details: `Purchase failed (${statusLabel}): ${
          err instanceof Error ? err.message : String(err)
        }`,
      },
      getPgPool()
    );
    throw err;
  }
}

export interface PurchaseGroupSetRequest {
  accountId: string;
  ipAddress: string;
  idempotencyKey?: string;
  clientCurrentCredits?: number;
  clientVaultItems?: VaultItemInstance[];
  groupId: number;
  level: number;
  option: number;
  luck: boolean;
  exlOptions: boolean[];
  ancientStamina: 0 | 5 | 10;
}

export async function executePurchaseGroupSetTx(
  req: PurchaseGroupSetRequest
): Promise<PurchaseTransactionResult> {
  const cleanAccount = (req.accountId || '').trim();
  if (!cleanAccount) {
    throw new TransactionDomainError('INVALID_ACCOUNT', 400, 'Account ID is required.');
  }

  const idemKey = req.idempotencyKey?.trim();
  if (idemKey) {
    const claim = await claimIdempotencyKey('purchase_set', `${cleanAccount}:${idemKey}`, 3600);
    if (claim.state === 'COMPLETED') {
      return {
        ...(claim.cachedResponse as PurchaseTransactionResult),
        idempotentReplay: true,
      };
    }
    if (claim.state === 'IN_PROGRESS') {
      throw new TransactionDomainError(
        'DUPLICATE_IN_FLIGHT',
        409,
        'Duplicate set purchase request is currently being processed.'
      );
    }
  }

  try {
    const { bundle } = await getCatalogBundleCached();
    const group = bundle.groups.find((g) => g.id === Number(req.groupId));
    if (!group) {
      throw new TransactionDomainError('GROUP_NOT_FOUND', 404, 'Item group not found.');
    }

    const memberItems = group.memberUids
      .map((u) => bundle.items.find((it) => it.uid === u))
      .filter((it): it is WebShopItem => Boolean(it));

    const sanitized = sanitizeAndPriceGroupSet(
      group,
      memberItems,
      {
        level: req.level,
        option: req.option,
        luck: req.luck,
        exlOptions: req.exlOptions,
        ancientStamina: req.ancientStamina,
      },
      serverConfig
    );

    if (pgPool && pgHealthy) {
      const client = await pgPool.connect();
      try {
        await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

        // 1. MEMB_STAT Online Check
        const membRes = await client.query<{ ConnectStat: number; ServerName: string }>(
          `SELECT "ConnectStat", "ServerName"
           FROM "MEMB_STAT"
           WHERE LOWER("memb___id") = LOWER($1)
           FOR SHARE`,
          [cleanAccount]
        );
        if (membRes.rows[0]?.ConnectStat === 1) {
          throw new TransactionDomainError(
            'ACCOUNT_ONLINE_MEMB_STAT',
            409,
            `Rejected by MEMB_STAT Anti-Dupe Guard: Account "${cleanAccount}" is currently online (${membRes.rows[0].ServerName}, ConnectStat = 1).`
          );
        }

        // 2. Lock Account Row
        const accRes = await client.query<{
          login_name: string;
          credits: number;
          wcoinc: number;
        }>(
          `SELECT login_name, credits, wcoinc
           FROM webshop_accounts
           WHERE LOWER(login_name) = LOWER($1)
           FOR UPDATE`,
          [cleanAccount]
        );
        const dbAcc = accRes.rows[0];
        if (!dbAcc) {
          throw new TransactionDomainError('ACCOUNT_NOT_FOUND', 404, 'Account not found.');
        }
        if (dbAcc.credits < sanitized.totalCredits) {
          throw new TransactionDomainError(
            'INSUFFICIENT_CREDITS',
            402,
            'You do not have enough credits to do that.'
          );
        }

        // 3. Lock Warehouse Items & Fit All Set Pieces Atomically
        const whRes = await client.query<{
          instance_id: string;
          slot_index: number;
          serial: string;
          item_hex: string;
          item_uid: number;
          item_id: number;
          item_type: number;
          name: string;
          width: number;
          height: number;
        }>(
          `SELECT instance_id, slot_index, serial, item_hex, item_uid, item_id, item_type, name, width, height
           FROM webshop_warehouse_items
           WHERE LOWER(account_login) = LOWER($1)
           FOR UPDATE`,
          [dbAcc.login_name]
        );

        const simulatedVault: VaultItemInstance[] = whRes.rows.map((r) => ({
          instanceId: r.instance_id,
          serial: r.serial,
          itemHex: r.item_hex,
          slotIndex: r.slot_index,
          itemUid: r.item_uid,
          itemId: r.item_id,
          itemType: r.item_type,
          name: r.name,
          X: r.width,
          Y: r.height,
          level: 0,
          option: 0,
          luck: false,
          skill: false,
          exlOptions: [false, false, false, false, false, false],
          ancientStamina: 0,
          fenrirVariant: 0,
          durability: 255,
          paidCredits: 0,
          canSellBack: false,
          purchasedAt: 0,
        }));

        const createdInstances: VaultItemInstance[] = [];
        const purchasedAt = Math.floor(Date.now() / 1000);
        const exlMask = sanitized.exlOptions.reduce(
          (acc, on, idx) => (on ? acc | (1 << idx) : acc),
          0
        );

        for (const mItem of memberItems) {
          const slot = locateFreeWarehouseSlot(simulatedVault, mItem.X, mItem.Y);
          if (
            slot === 1337 ||
            !verifySlotPlacement(simulatedVault, slot, mItem.X, mItem.Y)
          ) {
            throw new TransactionDomainError(
              'WAREHOUSE_FULL',
              409,
              `You do not have enough free slots in your vault for all pieces of ${group.name} (failed at ${mItem.name}).`
            );
          }

          const seqRes = await client.query<{ seq: string }>(
            `SELECT nextval('webshop_item_serial_seq') AS seq`
          );
          const seqNum = (Number(seqRes.rows[0].seq) & 0xffffffff) >>> 0 || 1;
          const serial = seqNum.toString(16).toUpperCase().padStart(8, '0');
          const lv = mItem.hasLevel === 1 ? sanitized.level : 0;
          const op = mItem.hasOption === 1 ? sanitized.option : 0;
          const lk = mItem.luck === 1 ? sanitized.luck : false;

          const itemHex = encodeSeason6ItemHex({
            itemId: mItem.id,
            itemType: mItem.type,
            level: lv,
            option: op,
            luck: lk,
            skill: false,
            durability: 255,
            serial,
            exlOptions: sanitized.exlOptions,
            ancientStamina: sanitized.ancientStamina,
            fenrirVariant: 0,
          });

          const inst: VaultItemInstance = {
            instanceId: `${serial}_${Date.now()}_${mItem.uid}`,
            serial,
            itemHex,
            slotIndex: slot,
            itemUid: mItem.uid,
            itemId: mItem.id,
            itemType: mItem.type,
            name: mItem.name,
            X: mItem.X,
            Y: mItem.Y,
            level: lv,
            option: op,
            luck: lk,
            skill: false,
            exlOptions: sanitized.exlOptions,
            ancientStamina: sanitized.ancientStamina,
            fenrirVariant: 0,
            durability: 255,
            paidCredits: Math.round(
              sanitized.totalCredits / Math.max(1, memberItems.length)
            ),
            canSellBack: false,
            purchasedAt,
          };

          await client.query(
            `INSERT INTO webshop_warehouse_items (
              instance_id, account_login, slot_index, serial, item_hex,
              item_uid, item_id, item_type, name, width, height,
              item_level, item_option, luck, skill, exl_mask,
              ancient_stamina, fenrir_variant, durability, paid_credits,
              can_sell_back, purchased_at
            ) VALUES (
              $1, $2, $3, $4, $5,
              $6, $7, $8, $9, $10, $11,
              $12, $13, $14, FALSE, $15,
              $16, 0, 255, $17,
              FALSE, $18
            )`,
            [
              inst.instanceId,
              dbAcc.login_name,
              slot,
              serial,
              itemHex,
              mItem.uid,
              mItem.id,
              mItem.type,
              mItem.name,
              mItem.X,
              mItem.Y,
              lv,
              op,
              lk,
              exlMask,
              sanitized.ancientStamina,
              inst.paidCredits,
              purchasedAt,
            ]
          );

          simulatedVault.push(inst);
          createdInstances.push(inst);
        }

        // 4. Deduct Credits
        const deductRes = await client.query<{ credits: number; wcoinc: number }>(
          `UPDATE webshop_accounts
           SET credits = credits - $1, updated_at = NOW()
           WHERE login_name = $2 AND credits >= $1
           RETURNING credits, wcoinc`,
          [sanitized.totalCredits, dbAcc.login_name]
        );
        if (deductRes.rowCount !== 1) {
          throw new TransactionDomainError(
            'BALANCE_RACE_ABORTED',
            409,
            'Concurrent credit modification detected; transaction rolled back.'
          );
        }

        await recordAuditLog(
          {
            accountId: dbAcc.login_name,
            ipAddress: req.ipAddress,
            action: 'PURCHASE_ITEM_SET',
            status: 'COMMITTED',
            itemHex: createdInstances.map((i) => i.itemHex).join(','),
            itemSerial: createdInstances[0]?.serial || null,
            creditsDelta: -sanitized.totalCredits,
            idempotencyKey: idemKey || null,
            details: `Bought Set Pack "${group.name}" (${createdInstances.length} items, Serials: ${createdInstances
              .map((i) => i.serial)
              .join(', ')}) for ${sanitized.totalCredits} credits`,
          },
          client
        );

        await client.query('COMMIT');

        const responsePayload: PurchaseTransactionResult = {
          ok: true,
          chargedCredits: sanitized.totalCredits,
          chargedWCoinC: 0,
          remainingCredits: deductRes.rows[0].credits,
          remainingWCoinC: deductRes.rows[0].wcoinc,
          addedItems: createdInstances,
          warehouseHex3840: encodeWarehouseHex3840(simulatedVault),
          message: `Successfully added all ${createdInstances.length} pieces of ${group.name} to your warehouse vault!`,
        };

        if (idemKey) {
          await finalizeIdempotencyKey(
            'purchase_set',
            `${cleanAccount}:${idemKey}`,
            responsePayload,
            3600
          );
        }
        return responsePayload;
      } catch (txErr) {
        await client.query('ROLLBACK').catch(() => {});
        throw txErr;
      } finally {
        client.release();
      }
    }

    // Embedded ACID Fallback with Per-Account Mutex & Snapshot Rollback
    return await withAccountMutex(cleanAccount, async () => {
      const key = cleanAccount.toLowerCase();
      const memAcc = memoryAccounts.get(key);
      if (!memAcc) {
        throw new TransactionDomainError(
          'ACCOUNT_NOT_FOUND',
          404,
          'Account not found. Please sign in first.'
        );
      }
      if (
        typeof req.clientCurrentCredits === 'number' &&
        Number.isFinite(req.clientCurrentCredits) &&
        req.clientCurrentCredits >= 0
      ) {
        memAcc.credits = Math.trunc(req.clientCurrentCredits);
      }
      if (Array.isArray(req.clientVaultItems)) {
        memAcc.vaultItems = structuredClone(req.clientVaultItems);
      }

      const snapshot = structuredClone(memAcc);

      try {
        const stat = memoryMembStat.get(key);
        if (stat && stat.ConnectStat === 1) {
          throw new TransactionDomainError(
            'ACCOUNT_ONLINE_MEMB_STAT',
            409,
            `Rejected by MEMB_STAT Anti-Dupe Guard: Account "${memAcc.loginName}" is currently online (${stat.ServerName}, ConnectStat = 1). Please log out before adding set items.`
          );
        }

        if (memAcc.credits < sanitized.totalCredits) {
          throw new TransactionDomainError(
            'INSUFFICIENT_CREDITS',
            402,
            'You do not have enough credits to do that.'
          );
        }

        const simulatedVault = [...memAcc.vaultItems];
        const createdInstances: VaultItemInstance[] = [];
        const purchasedAt = Math.floor(Date.now() / 1000);

        for (const mItem of memberItems) {
          const slot = locateFreeWarehouseSlot(simulatedVault, mItem.X, mItem.Y);
          if (
            slot === 1337 ||
            !verifySlotPlacement(simulatedVault, slot, mItem.X, mItem.Y)
          ) {
            throw new TransactionDomainError(
              'WAREHOUSE_FULL',
              409,
              `You do not have enough free slots in your vault for all pieces of ${group.name} (failed at ${mItem.name}).`
            );
          }

          const serial = generateUniqueItemSerial();
          const lv = mItem.hasLevel === 1 ? sanitized.level : 0;
          const op = mItem.hasOption === 1 ? sanitized.option : 0;
          const lk = mItem.luck === 1 ? sanitized.luck : false;
          const itemHex = encodeSeason6ItemHex({
            itemId: mItem.id,
            itemType: mItem.type,
            level: lv,
            option: op,
            luck: lk,
            skill: false,
            durability: 255,
            serial,
            exlOptions: sanitized.exlOptions,
            ancientStamina: sanitized.ancientStamina,
            fenrirVariant: 0,
          });

          const inst: VaultItemInstance = {
            instanceId: `${serial}_${Date.now()}_${mItem.uid}`,
            serial,
            itemHex,
            slotIndex: slot,
            itemUid: mItem.uid,
            itemId: mItem.id,
            itemType: mItem.type,
            name: mItem.name,
            X: mItem.X,
            Y: mItem.Y,
            level: lv,
            option: op,
            luck: lk,
            skill: false,
            exlOptions: sanitized.exlOptions,
            ancientStamina: sanitized.ancientStamina,
            fenrirVariant: 0,
            durability: 255,
            paidCredits: Math.round(
              sanitized.totalCredits / Math.max(1, memberItems.length)
            ),
            canSellBack: false,
            purchasedAt,
          };

          simulatedVault.push(inst);
          createdInstances.push(inst);
        }

        memAcc.credits -= sanitized.totalCredits;
        memAcc.vaultItems = simulatedVault;

        await recordAuditLog({
          accountId: memAcc.loginName,
          ipAddress: req.ipAddress,
          action: 'PURCHASE_ITEM_SET',
          status: 'COMMITTED',
          itemHex: createdInstances.map((i) => i.itemHex).join(','),
          itemSerial: createdInstances[0]?.serial || null,
          creditsDelta: -sanitized.totalCredits,
          idempotencyKey: idemKey || null,
          details: `Bought Set Pack "${group.name}" (${createdInstances.length} items, Serials: ${createdInstances
            .map((i) => i.serial)
            .join(', ')}) for ${sanitized.totalCredits} credits`,
        });

        const responsePayload: PurchaseTransactionResult = {
          ok: true,
          chargedCredits: sanitized.totalCredits,
          chargedWCoinC: 0,
          remainingCredits: memAcc.credits,
          remainingWCoinC: memAcc.wCoinC,
          addedItems: createdInstances,
          warehouseHex3840: encodeWarehouseHex3840(memAcc.vaultItems),
          message: `Successfully added all ${createdInstances.length} pieces of ${group.name} to your warehouse vault!`,
        };

        if (idemKey) {
          await finalizeIdempotencyKey(
            'purchase_set',
            `${cleanAccount}:${idemKey}`,
            responsePayload,
            3600
          );
        }
        return responsePayload;
      } catch (innerErr) {
        memoryAccounts.set(key, snapshot);
        throw innerErr;
      }
    });
  } catch (err) {
    if (idemKey) {
      await releaseIdempotencyKey('purchase_set', `${cleanAccount}:${idemKey}`);
    }
    const statusLabel =
      err instanceof TransactionDomainError ? 'REJECTED' : 'ROLLED_BACK';
    await recordAuditLog(
      {
        accountId: cleanAccount,
        ipAddress: req.ipAddress,
        action: 'PURCHASE_ITEM_SET',
        status: statusLabel,
        idempotencyKey: idemKey || null,
        details: `Set purchase failed (${statusLabel}): ${
          err instanceof Error ? err.message : String(err)
        }`,
      },
      getPgPool()
    );
    throw err;
  }
}

export async function executeRefundVaultItemTx(params: {
  accountId: string;
  ipAddress: string;
  instanceId: string;
  serial: string;
  clientCurrentCredits?: number;
  clientVaultItems?: VaultItemInstance[];
}): Promise<{
  ok: true;
  refundCredits: number;
  remainingCredits: number;
  message: string;
}> {
  const cleanAccount = (params.accountId || '').trim();
  if (!cleanAccount) {
    throw new TransactionDomainError('INVALID_ACCOUNT', 400, 'Account ID is required.');
  }

  try {
    if (pgPool && pgHealthy) {
      const client = await pgPool.connect();
      try {
        await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

        const membRes = await client.query<{ ConnectStat: number; ServerName: string }>(
          `SELECT "ConnectStat", "ServerName"
           FROM "MEMB_STAT"
           WHERE LOWER("memb___id") = LOWER($1)
           FOR SHARE`,
          [cleanAccount]
        );
        if (membRes.rows[0]?.ConnectStat === 1) {
          throw new TransactionDomainError(
            'ACCOUNT_ONLINE_MEMB_STAT',
            409,
            `Rejected by MEMB_STAT Anti-Dupe Guard: Account "${cleanAccount}" must be offline (ConnectStat = 0) before selling back vault items.`
          );
        }

        const itemRes = await client.query<{
          instance_id: string;
          serial: string;
          item_hex: string;
          name: string;
          paid_credits: number;
          can_sell_back: boolean;
        }>(
          `DELETE FROM webshop_warehouse_items
           WHERE LOWER(account_login) = LOWER($1)
             AND (instance_id = $2 OR serial = $3)
           RETURNING instance_id, serial, item_hex, name, paid_credits, can_sell_back`,
          [cleanAccount, params.instanceId, params.serial.toUpperCase()]
        );

        const removed = itemRes.rows[0];
        if (!removed) {
          throw new TransactionDomainError(
            'ITEM_NOT_IN_VAULT',
            404,
            'Item no longer exists in your warehouse (possible duplicate sellback prevented).'
          );
        }

        const refundCredits = Math.round(
          removed.paid_credits * serverConfig.credits.sellback_Q
        );
        if (!removed.can_sell_back || refundCredits < 1) {
          throw new TransactionDomainError(
            'RESALE_FORBIDDEN',
            403,
            'You are not allowed to resell that item.'
          );
        }

        const credRes = await client.query<{ credits: number }>(
          `UPDATE webshop_accounts
           SET credits = credits + $1, updated_at = NOW()
           WHERE LOWER(login_name) = LOWER($2)
           RETURNING credits`,
          [refundCredits, cleanAccount]
        );

        await recordAuditLog(
          {
            accountId: cleanAccount,
            ipAddress: params.ipAddress,
            action: 'REFUND_VAULT_ITEM',
            status: 'COMMITTED',
            itemHex: removed.item_hex,
            itemSerial: removed.serial,
            creditsDelta: refundCredits,
            details: `Sold back ${removed.name} (Serial: ${removed.serial}) for +${refundCredits} credits`,
          },
          client
        );

        await client.query('COMMIT');
        return {
          ok: true,
          refundCredits,
          remainingCredits: credRes.rows[0]?.credits ?? refundCredits,
          message: `Sold back ${removed.name} for +${refundCredits.toLocaleString()} credits!`,
        };
      } catch (txErr) {
        await client.query('ROLLBACK').catch(() => {});
        throw txErr;
      } finally {
        client.release();
      }
    }

    return await withAccountMutex(cleanAccount, async () => {
      const key = cleanAccount.toLowerCase();
      const memAcc = memoryAccounts.get(key);
      if (!memAcc) {
        throw new TransactionDomainError('ACCOUNT_NOT_FOUND', 404, 'Account not found.');
      }

      if (
        typeof params.clientCurrentCredits === 'number' &&
        Number.isFinite(params.clientCurrentCredits) &&
        params.clientCurrentCredits >= 0
      ) {
        memAcc.credits = Math.trunc(params.clientCurrentCredits);
      }
      if (Array.isArray(params.clientVaultItems)) {
        memAcc.vaultItems = structuredClone(params.clientVaultItems);
      }

      const snapshot = structuredClone(memAcc);

      try {
        const stat = memoryMembStat.get(key);
        if (stat && stat.ConnectStat === 1) {
          throw new TransactionDomainError(
            'ACCOUNT_ONLINE_MEMB_STAT',
            409,
            `Rejected by MEMB_STAT Anti-Dupe Guard: Account "${memAcc.loginName}" must be offline (ConnectStat = 0) before selling back vault items.`
          );
        }

        const targetIdx = memAcc.vaultItems.findIndex(
          (it) =>
            it.instanceId === params.instanceId ||
            it.serial.toUpperCase() === params.serial.toUpperCase()
        );
        if (targetIdx < 0) {
          throw new TransactionDomainError(
            'ITEM_NOT_IN_VAULT',
            404,
            'Item not found in warehouse.'
          );
        }

        const target = memAcc.vaultItems[targetIdx];
        const refundCredits = Math.round(
          target.paidCredits * serverConfig.credits.sellback_Q
        );
        if (!target.canSellBack || refundCredits < 1) {
          throw new TransactionDomainError(
            'RESALE_FORBIDDEN',
            403,
            'You are not allowed to resell that item.'
          );
        }

        memAcc.vaultItems.splice(targetIdx, 1);
        memAcc.credits += refundCredits;

        await recordAuditLog({
          accountId: memAcc.loginName,
          ipAddress: params.ipAddress,
          action: 'REFUND_VAULT_ITEM',
          status: 'COMMITTED',
          itemHex: target.itemHex || encodeSeason6ItemHex(target),
          itemSerial: target.serial,
          creditsDelta: refundCredits,
          details: `Sold back ${target.name} (Serial: ${target.serial}) for +${refundCredits} credits`,
        });

        return {
          ok: true,
          refundCredits,
          remainingCredits: memAcc.credits,
          message: `Sold back ${target.name} for +${refundCredits.toLocaleString()} credits!`,
        };
      } catch (innerErr) {
        memoryAccounts.set(key, snapshot);
        throw innerErr;
      }
    });
  } catch (err) {
    const statusLabel =
      err instanceof TransactionDomainError ? 'REJECTED' : 'ROLLED_BACK';
    await recordAuditLog(
      {
        accountId: cleanAccount,
        ipAddress: params.ipAddress,
        action: 'REFUND_VAULT_ITEM',
        status: statusLabel,
        itemSerial: params.serial,
        details: `Refund failed (${statusLabel}): ${
          err instanceof Error ? err.message : String(err)
        }`,
      },
      getPgPool()
    );
    throw err;
  }
}

// ============================================================================
// IDEMPOTENT PAYMENT GATEWAY WEBHOOK & COIN GRANT ACID TRANSACTION
// ============================================================================
export interface PaymentGrantTxInput {
  idempotencyKey: string;
  loginName: string;
  ipAddress: string;
  coinType: CashShopCoinType;
  coinAmount: number;
  creditsAdded: number;
  reason: string;
  reference: string;
  clientName: string;
}

export interface PaymentGrantTxResult {
  status: 'Created' | 'AlreadyGranted';
  idempotentReplay: boolean;
  grant: OpenMuCoinGrant;
  balances: {
    credits: number;
    wCoinC: number;
    wCoinP: number;
    goblinPoints: number;
  };
}

export async function executePaymentGrantTx(
  input: PaymentGrantTxInput
): Promise<PaymentGrantTxResult> {
  const cleanIdem = (input.idempotencyKey || input.reference || '').trim();
  if (!cleanIdem || cleanIdem.length < 4 || cleanIdem.length > 128) {
    throw new TransactionDomainError(
      'INVALID_IDEMPOTENCY_KEY',
      400,
      'Valid Idempotency-Key (4..128 chars) is required.'
    );
  }

  // 1. Atomic Redis Idempotency Claim (Blocks Replay Attacks & Concurrent Retries)
  const claim = await claimIdempotencyKey('payment_webhook', cleanIdem, 86_400);
  if (claim.state === 'COMPLETED') {
    const cached = claim.cachedResponse as PaymentGrantTxResult;
    return {
      ...cached,
      status: 'AlreadyGranted',
      idempotentReplay: true,
      grant: { ...cached.grant, status: 'AlreadyGranted' },
    };
  }
  if (claim.state === 'IN_PROGRESS') {
    throw new TransactionDomainError(
      'WEBHOOK_IN_PROGRESS',
      409,
      `Payment transaction with Idempotency-Key "${cleanIdem}" is currently processing.`
    );
  }

  try {
    // Branch A: PostgreSQL ACID Transaction with UNIQUE(idempotency_key) & UNIQUE(reference)
    if (pgPool && pgHealthy) {
      const client = await pgPool.connect();
      try {
        await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

        const existingKey = await client.query<{ response_json: PaymentGrantTxResult }>(
          `SELECT response_json
           FROM payment_idempotency_keys
           WHERE idempotency_key = $1 OR reference = $2
           LIMIT 1
           FOR SHARE`,
          [cleanIdem, input.reference]
        );

        if (existingKey.rows[0]) {
          await client.query('ROLLBACK');
          const cached = existingKey.rows[0].response_json;
          const replayResult: PaymentGrantTxResult = {
            ...cached,
            status: 'AlreadyGranted',
            idempotentReplay: true,
            grant: { ...cached.grant, status: 'AlreadyGranted' },
          };
          await finalizeIdempotencyKey('payment_webhook', cleanIdem, replayResult, 86_400);
          return replayResult;
        }

        const colMap: Record<CashShopCoinType, string> = {
          WCoinC: 'wcoinc',
          WCoinP: 'wcoinp',
          GoblinPoints: 'goblin_points',
        };
        const targetCol = colMap[input.coinType];

        const updRes = await client.query<{
          login_name: string;
          credits: number;
          wcoinc: number;
          wcoinp: number;
          goblin_points: number;
        }>(
          `UPDATE webshop_accounts
           SET credits = credits + $1,
               ${targetCol} = ${targetCol} + $2,
               updated_at = NOW()
           WHERE LOWER(login_name) = LOWER($3)
           RETURNING login_name, credits, wcoinc, wcoinp, goblin_points`,
          [input.creditsAdded, input.coinAmount, input.loginName.trim()]
        );
        const accRow = updRes.rows[0];
        if (!accRow) {
          throw new TransactionDomainError(
            'ACCOUNT_NOT_FOUND',
            404,
            `Account "${input.loginName.trim()}" does not exist.`
          );
        }

        const grant: OpenMuCoinGrant = {
          id: `grant-${crypto.randomUUID().slice(0, 8)}`,
          accountLoginName: accRow.login_name,
          coinType: input.coinType,
          amount: input.coinAmount,
          creditsAdded: input.creditsAdded,
          reason: input.reason,
          reference: input.reference,
          idempotencyKey: cleanIdem,
          clientName: input.clientName,
          createdAt: new Date().toISOString(),
          status: 'Created',
        };

        const resultPayload: PaymentGrantTxResult = {
          status: 'Created',
          idempotentReplay: false,
          grant,
          balances: {
            credits: accRow.credits,
            wCoinC: accRow.wcoinc,
            wCoinP: accRow.wcoinp,
            goblinPoints: accRow.goblin_points,
          },
        };

        await client.query(
          `INSERT INTO payment_idempotency_keys (
            idempotency_key, reference, account_login, coin_type,
            coin_amount, credits_added, reason, client_name, response_json
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            cleanIdem,
            input.reference,
            accRow.login_name,
            input.coinType,
            input.coinAmount,
            input.creditsAdded,
            input.reason,
            input.clientName,
            JSON.stringify(resultPayload),
          ]
        );

        await recordAuditLog(
          {
            accountId: accRow.login_name,
            ipAddress: input.ipAddress,
            action: 'PAYMENT_GRANT_CREDITED',
            status: 'COMMITTED',
            creditsDelta: input.creditsAdded,
            wCoinCDelta: input.coinType === 'WCoinC' ? input.coinAmount : 0,
            idempotencyKey: cleanIdem,
            details: `${input.clientName}: +${input.creditsAdded} Credits & +${input.coinAmount} ${input.coinType} [Ref: ${input.reference}] (${input.reason})`,
          },
          client
        );

        await client.query('COMMIT');
        memoryGrantsList.unshift(grant);
        await finalizeIdempotencyKey('payment_webhook', cleanIdem, resultPayload, 86_400);
        return resultPayload;
      } catch (txErr) {
        await client.query('ROLLBACK').catch(() => {});
        throw txErr;
      } finally {
        client.release();
      }
    }

    // Branch B: Embedded ACID Transaction
    return await withAccountMutex(input.loginName, async () => {
      const existingGrant =
        memoryGrantsByIdempotency.get(cleanIdem) ||
        memoryGrantsByReference.get(input.reference);

      const key = input.loginName.trim().toLowerCase();
      const acc = memoryAccounts.get(key);
      if (!acc) {
        throw new TransactionDomainError(
          'ACCOUNT_NOT_FOUND',
          404,
          `Account "${input.loginName.trim()}" does not exist.`
        );
      }

      if (existingGrant) {
        const replayPayload: PaymentGrantTxResult = {
          status: 'AlreadyGranted',
          idempotentReplay: true,
          grant: { ...existingGrant, status: 'AlreadyGranted' },
          balances: {
            credits: acc.credits,
            wCoinC: acc.wCoinC,
            wCoinP: acc.wCoinP,
            goblinPoints: acc.goblinPoints,
          },
        };
        await finalizeIdempotencyKey('payment_webhook', cleanIdem, replayPayload, 86_400);
        return replayPayload;
      }

      const snapshot = structuredClone(acc);
      try {
        acc.credits = Math.max(0, acc.credits + input.creditsAdded);
        if (input.coinType === 'WCoinC') {
          acc.wCoinC = Math.max(0, acc.wCoinC + input.coinAmount);
        } else if (input.coinType === 'WCoinP') {
          acc.wCoinP = Math.max(0, acc.wCoinP + input.coinAmount);
        } else {
          acc.goblinPoints = Math.max(0, acc.goblinPoints + input.coinAmount);
        }

        const grant: OpenMuCoinGrant = {
          id: `grant-${crypto.randomUUID().slice(0, 8)}`,
          accountLoginName: acc.loginName,
          coinType: input.coinType,
          amount: input.coinAmount,
          creditsAdded: input.creditsAdded,
          reason: input.reason,
          reference: input.reference,
          idempotencyKey: cleanIdem,
          clientName: input.clientName,
          createdAt: new Date().toISOString(),
          status: 'Created',
        };

        memoryGrantsByIdempotency.set(cleanIdem, grant);
        memoryGrantsByReference.set(input.reference, grant);
        memoryGrantsList.unshift(grant);

        await recordAuditLog({
          accountId: acc.loginName,
          ipAddress: input.ipAddress,
          action: 'PAYMENT_GRANT_CREDITED',
          status: 'COMMITTED',
          creditsDelta: input.creditsAdded,
          wCoinCDelta: input.coinType === 'WCoinC' ? input.coinAmount : 0,
          idempotencyKey: cleanIdem,
          details: `${input.clientName}: +${input.creditsAdded} Credits & +${input.coinAmount} ${input.coinType} [Ref: ${input.reference}] (${input.reason})`,
        });

        const resultPayload: PaymentGrantTxResult = {
          status: 'Created',
          idempotentReplay: false,
          grant,
          balances: {
            credits: acc.credits,
            wCoinC: acc.wCoinC,
            wCoinP: acc.wCoinP,
            goblinPoints: acc.goblinPoints,
          },
        };

        await finalizeIdempotencyKey('payment_webhook', cleanIdem, resultPayload, 86_400);
        return resultPayload;
      } catch (innerErr) {
        memoryAccounts.set(key, snapshot);
        throw innerErr;
      }
    });
  } catch (err) {
    await releaseIdempotencyKey('payment_webhook', cleanIdem);
    await recordAuditLog(
      {
        accountId: input.loginName || 'unknown',
        ipAddress: input.ipAddress,
        action: 'PAYMENT_GRANT_CREDITED',
        status: err instanceof TransactionDomainError ? 'REJECTED' : 'ROLLED_BACK',
        idempotencyKey: cleanIdem,
        details: `Payment grant failed: ${err instanceof Error ? err.message : String(err)}`,
      },
      getPgPool()
    );
    throw err;
  }
}
