import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import {
  DEFAULT_WEBSHOP_CONFIG,
  INITIAL_GROUPS,
} from '../data/initialState';
import { INITIAL_WEBSHOP_ITEMS, WebShopItem } from '../data/webshopItems';
import {
  Character,
  ItemGroup,
  MuClassCode,
  PayPalPromoPackage,
  PromotionConfig,
  TrueMoneyPromoTier,
  UserRole,
  VaultItemInstance,
  WebShopConfig,
} from '../types/webshop';
import {
  BUY_CHAR_400_CREDITS,
  CATEGORY_NAMES,
  DELETE_CHAR_400_REWARD_CREDITS,
  MU_CLASSES,
  ONLINE_HOUR_REWARD_CREDITS,
  calculateClassStatPoints,
} from '../utils/muItemLogic';
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
  onlineMinutes: number;
  exchangedOnlineHours: number;
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
// Database & In-Memory Store Initialization
// ============================================================================
export const memoryAccounts = new Map<string, ServerAccountRecord>();
export const memoryCharacters = new Map<string, Character>();
export const memoryMembStat = new Map<string, MembStatRow>();
export const memoryGrantsByIdempotency = new Map<string, OpenMuCoinGrant>();
export const memoryGrantsByReference = new Map<string, OpenMuCoinGrant>();
export const memoryGrantsList: OpenMuCoinGrant[] = [];
export const memoryCreditExchanges = new Map<
  string,
  {
    status: 'pending' | 'completed';
    account_login: string;
    credits_spent: number;
    wcoinc_granted: number;
  }
>();

export interface AuthoritativeItemOrder {
  reference: string;
  accountLogin: string;
  itemUid: number;
  packageSequence: number;
  priceSequence: number | null;
  chargedCredits: number;
  status: 'pending' | 'delivered' | 'rejected' | 'manual_review';
  openMuGrantId: string | null;
  failureCode: string | null;
  remainingCredits: number;
}

export const memoryAuthoritativeItemOrders = new Map<string, AuthoritativeItemOrder>();

export let serverCatalog: WebShopItem[] = structuredClone(INITIAL_WEBSHOP_ITEMS);
export let serverGroups: ItemGroup[] = structuredClone(INITIAL_GROUPS);
export let serverConfig: WebShopConfig = structuredClone(DEFAULT_WEBSHOP_CONFIG);
export let catalogVersion = 1;
export let memoryPromotionConfig: PromotionConfig = buildDefaultPromotionConfig();

export function seedMemoryStore(): void {
  const envAdmin = (process.env.ADMIN_USERNAME || 'admin').trim();
  const envPass = process.env.ADMIN_PASSWORD || 'admin';
  const envDeleteCode = /^\d{4,8}$/.test(process.env.ADMIN_DELETE_CODE || '')
    ? String(process.env.ADMIN_DELETE_CODE)
    : '123456';

  const initialAccounts: Array<{
    loginName: string;
    password: string;
    securityCode: string;
    state: 'Normal' | 'GameMaster';
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    isMasterAdmin: boolean;
    credits: number;
    wCoinC: number;
    vaultMoney: number;
    onlineMinutes: number;
    exchangedOnlineHours: number;
  }> = [
    {
      loginName: envAdmin,
      password: envPass,
      securityCode: envDeleteCode,
      state: 'GameMaster',
      role: 'SUPER_ADMIN',
      isMasterAdmin: true,
      credits: 100_000,
      wCoinC: 10_000,
      vaultMoney: 500_000_000,
      onlineMinutes: 360,
      exchangedOnlineHours: 4,
    },
    {
      loginName: 'user01',
      password: '123456',
      securityCode: '123456',
      state: 'Normal',
      role: 'USER',
      isMasterAdmin: false,
      credits: 50_000,
      wCoinC: 5_000,
      vaultMoney: 100_000_000,
      onlineMinutes: 240,
      exchangedOnlineHours: 2,
    },
    {
      loginName: 'admin01',
      password: '123456',
      securityCode: '123456',
      state: 'GameMaster',
      role: 'ADMIN',
      isMasterAdmin: false,
      credits: 50_000,
      wCoinC: 5_000,
      vaultMoney: 100_000_000,
      onlineMinutes: 300,
      exchangedOnlineHours: 3,
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
      credits: acc.credits,
      vaultMoney: acc.vaultMoney,
      onlineMinutes: acc.onlineMinutes,
      exchangedOnlineHours: acc.exchangedOnlineHours,
      wCoinC: acc.wCoinC,
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

  const seedChars: Array<{ name: string; accountId: string; classCode: MuClassCode; level: number }> = [
    { name: 'BladeKing', accountId: envAdmin, classCode: 'bm', level: 400 },
    { name: 'SoulLord', accountId: envAdmin, classCode: 'gm', level: 400 },
    { name: 'DarkKnight', accountId: 'user01', classCode: 'bm', level: 400 },
    { name: 'HighElf400', accountId: 'user01', classCode: 'he', level: 400 },
    { name: 'OriginGM', accountId: 'admin01', classCode: 'le', level: 400 },
  ];
  for (const sc of seedChars) {
    const calc = calculateClassStatPoints(sc.classCode, sc.level);
    memoryCharacters.set(sc.name.toLowerCase(), {
      name: sc.name,
      accountId: sc.accountId,
      classCode: calc.classDef.code,
      classId: calc.classDef.id,
      level: sc.level,
      resets: 0,
      levelUpPoints: calc.totalPoints,
      strength: calc.classDef.baseStr,
      agility: calc.classDef.baseAgi,
      vitality: calc.classDef.baseVit,
      energy: calc.classDef.baseEne,
      command: calc.classDef.baseCmd,
      money: 50_000_000,
      ctlCode: 0,
      isOnline: false,
    });
  }
}

const DB_URL = (
  process.env.OPENMU_DATABASE_URL ||
  process.env.DATABASE_URL ||
  ''
).trim();

let pgPool: pg.Pool | null = null;
let pgHealthy = false;

export async function initializeDatabaseLayer(): Promise<void> {
  if (!DB_URL) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('OPENMU_DATABASE_URL is required. Embedded account and payment storage is disabled.');
    }
    console.warn('[Database] No OPENMU_DATABASE_URL configured. Initializing embedded ACID memory storage for development.');
    seedMemoryStore();
    return;
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
      const mappings = await client.query<{
        item_uid: number;
        package_sequence: number | null;
        price_sequence: number | null;
        item_json: WebShopItem | null;
      }>('SELECT item_uid, package_sequence, price_sequence, item_json FROM webshop_catalog_openmu_mappings');
      for (const mapping of mappings.rows) {
        const persisted = mapping.item_json;
        const item = persisted ?? serverCatalog.find((candidate) => candidate.uid === mapping.item_uid);
        if (!item) continue;
        if (mapping.package_sequence === null) {
          delete item.openMuPackageSequence;
          delete item.openMuPriceSequence;
        } else {
          item.openMuPackageSequence = mapping.package_sequence;
          item.openMuPriceSequence = mapping.price_sequence;
        }
        const index = serverCatalog.findIndex((candidate) => candidate.uid === mapping.item_uid);
        if (index >= 0) {
          serverCatalog[index] = item;
        } else {
          serverCatalog.push(item);
        }
      }
      pgHealthy = true;
      console.info('[Database] PostgreSQL connected & ACID schema verified.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(`[Database] PostgreSQL unavailable (${err instanceof Error ? err.message : err}).`);
    pgHealthy = false;
    if (process.env.NODE_ENV === 'production') {
      throw err;
    }
    console.warn('[Database] Falling back to embedded ACID memory storage for development.');
    seedMemoryStore();
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
      online_minutes INTEGER NOT NULL DEFAULT 0 CHECK (online_minutes >= 0),
      exchanged_online_hours INTEGER NOT NULL DEFAULT 0 CHECK (exchanged_online_hours >= 0),
      wcoinc INTEGER NOT NULL DEFAULT 0 CHECK (wcoinc >= 0),
      wcoinp INTEGER NOT NULL DEFAULT 0 CHECK (wcoinp >= 0),
      goblin_points INTEGER NOT NULL DEFAULT 0 CHECK (goblin_points >= 0),
      vip_until TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE webshop_accounts
      ADD COLUMN IF NOT EXISTS security_code VARCHAR(16) NOT NULL DEFAULT '0000000';
    ALTER TABLE webshop_accounts
      ADD COLUMN IF NOT EXISTS online_minutes INTEGER NOT NULL DEFAULT 0 CHECK (online_minutes >= 0);
    ALTER TABLE webshop_accounts
      ADD COLUMN IF NOT EXISTS exchanged_online_hours INTEGER NOT NULL DEFAULT 0 CHECK (exchanged_online_hours >= 0);

    CREATE TABLE IF NOT EXISTS webshop_characters (
      name VARCHAR(20) PRIMARY KEY,
      account_login VARCHAR(20) NOT NULL,
      class_code VARCHAR(16) NOT NULL DEFAULT 'bm',
      class_id SMALLINT NOT NULL DEFAULT 18,
      level SMALLINT NOT NULL DEFAULT 400,
      resets INTEGER NOT NULL DEFAULT 0,
      level_up_points INTEGER NOT NULL DEFAULT 0,
      strength INTEGER NOT NULL DEFAULT 28,
      agility INTEGER NOT NULL DEFAULT 20,
      vitality INTEGER NOT NULL DEFAULT 25,
      energy INTEGER NOT NULL DEFAULT 10,
      command INTEGER NOT NULL DEFAULT 0,
      money BIGINT NOT NULL DEFAULT 0,
      ctl_code SMALLINT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

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

    CREATE TABLE IF NOT EXISTS webshop_item_orders (
      reference VARCHAR(128) PRIMARY KEY,
      account_login VARCHAR(20) NOT NULL,
      item_uid INTEGER NOT NULL,
      package_sequence INTEGER NOT NULL,
      price_sequence INTEGER,
      charged_credits INTEGER NOT NULL CHECK (charged_credits > 0),
      status VARCHAR(16) NOT NULL CHECK (status IN ('pending', 'delivered', 'rejected', 'manual_review')),
      openmu_grant_id UUID,
      failure_code VARCHAR(64),
      response_json JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_webshop_item_orders_account_created
      ON webshop_item_orders (LOWER(account_login), created_at DESC);

    CREATE TABLE IF NOT EXISTS webshop_catalog_openmu_mappings (
      item_uid INTEGER PRIMARY KEY,
      package_sequence INTEGER CHECK (package_sequence >= 0),
      price_sequence INTEGER,
      item_json JSONB,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE webshop_catalog_openmu_mappings
      ADD COLUMN IF NOT EXISTS item_json JSONB;
    ALTER TABLE webshop_catalog_openmu_mappings
      ALTER COLUMN package_sequence DROP NOT NULL;

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
  vaultMoney: number;
  onlineMinutes: number;
  exchangedOnlineHours: number;
  vipUntil: string | null;
  isAdmin: boolean;
  role: UserRole;
  wCoinC: number;
  wCoinP: number;
  goblinPoints: number;
}

function getConfiguredAdminUsernames(): Set<string> {
  const configured = (process.env.ADMIN_ACCOUNTS ?? '')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
  const envAdmin = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
  if (envAdmin) configured.push(envAdmin);
  configured.push('admin01');
  return new Set(configured);
}

/** Authenticates against the authoritative OpenMU account table and creates only a webshop wallet row. */
export async function authenticateOpenMuAccount(
  loginName: string,
  password: string
): Promise<AuthenticatedOpenMuAccount | null> {
  const adminAccounts = getConfiguredAdminUsernames();
  if (!pgPool || !pgHealthy) {
    const mem = memoryAccounts.get(loginName.trim().toLowerCase());
    if (!mem) return null;
    const ok = verifyAccountPassword(mem.passwordHash, mem.passwordPlainOrSimulatedBcrypt, password);
    if (!ok) return null;
    const isAdmin = Boolean(
      mem.isMasterAdmin ||
        mem.role === 'ADMIN' ||
        mem.role === 'SUPER_ADMIN' ||
        mem.state === 'GameMaster' ||
        adminAccounts.has(mem.loginName.toLowerCase())
    );
    return {
      id: mem.id,
      loginName: mem.loginName,
      email: mem.email,
      state: mem.state === 'Normal' || mem.state === 'GameMaster' ? 0 : 1,
      credits: mem.credits,
      vaultMoney: mem.vaultMoney,
      onlineMinutes: mem.onlineMinutes,
      exchangedOnlineHours: mem.exchangedOnlineHours,
      vipUntil: mem.vipUntil,
      isAdmin,
      role: isAdmin ? (mem.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN') : 'USER',
      wCoinC: mem.wCoinC,
      wCoinP: mem.wCoinP,
      goblinPoints: mem.goblinPoints,
    };
  }

  const result = await pgPool.query<{
    Id: string;
    LoginName: string;
    PasswordHash: string;
    SecurityCode?: string;
    EMail: string;
    State: number;
    WCoinC: number;
    WCoinP: number;
    GoblinPoints: number;
  }>(
    `SELECT "Id", "LoginName", "PasswordHash", COALESCE("SecurityCode", '') AS "SecurityCode", "EMail", "State", "WCoinC", "WCoinP", "GoblinPoints"
       FROM data."Account"
      WHERE LOWER("LoginName") = LOWER($1)
      LIMIT 1`,
    [loginName]
  );
  const account = result.rows[0];
  if (!account || !(await bcrypt.compare(password, account.PasswordHash))) {
    return null;
  }

  const isConfiguredAdmin = adminAccounts.has(account.LoginName.toLowerCase()) || account.State === 2;
  await pgPool.query(
    `INSERT INTO webshop_accounts (
       id, login_name, password_hash, security_code, email, state, role, is_master_admin,
       credits, vault_money, wcoinc, wcoinp, goblin_points
     ) VALUES ($1, $2, '', $3, $4, $5, $6, $7, 0, 0, $8, $9, $10)
     ON CONFLICT (login_name) DO UPDATE SET
       security_code = CASE WHEN EXCLUDED.security_code <> '' THEN EXCLUDED.security_code ELSE webshop_accounts.security_code END,
       email = EXCLUDED.email,
       state = EXCLUDED.state,
       role = CASE WHEN webshop_accounts.role IN ('ADMIN', 'SUPER_ADMIN') THEN webshop_accounts.role ELSE EXCLUDED.role END,
       is_master_admin = webshop_accounts.is_master_admin OR EXCLUDED.is_master_admin,
       wcoinc = EXCLUDED.wcoinc,
       wcoinp = EXCLUDED.wcoinp,
       goblin_points = EXCLUDED.goblin_points,
       updated_at = NOW()`,
    [
      account.Id,
      account.LoginName,
      account.SecurityCode || '',
      account.EMail,
      String(account.State),
      isConfiguredAdmin ? 'ADMIN' : 'USER',
      isConfiguredAdmin,
      account.WCoinC,
      account.WCoinP,
      account.GoblinPoints,
    ]
  );
  const wallet = await pgPool.query<{
    credits: number;
    vault_money: string | number;
    online_minutes: number;
    exchanged_online_hours: number;
    vip_until: Date | null;
    role: UserRole;
    is_master_admin: boolean;
  }>(
    `SELECT credits, vault_money, online_minutes, exchanged_online_hours, vip_until, role, is_master_admin
       FROM webshop_accounts
      WHERE LOWER(login_name) = LOWER($1)
      LIMIT 1`,
    [account.LoginName]
  );
  const wRow = wallet.rows[0];
  const isAdmin = Boolean(
    isConfiguredAdmin ||
      wRow?.is_master_admin ||
      wRow?.role === 'ADMIN' ||
      wRow?.role === 'SUPER_ADMIN'
  );
  return {
    id: account.Id,
    loginName: account.LoginName,
    email: account.EMail,
    state: account.State === 2 ? 0 : account.State,
    credits: wRow?.credits ?? 0,
    vaultMoney: Number(wRow?.vault_money ?? 0),
    onlineMinutes: Number(wRow?.online_minutes ?? 0),
    exchangedOnlineHours: Number(wRow?.exchanged_online_hours ?? 0),
    vipUntil: wRow?.vip_until ? new Date(wRow.vip_until).toISOString() : null,
    isAdmin,
    role: isAdmin ? 'ADMIN' : 'USER',
    wCoinC: account.WCoinC,
    wCoinP: account.WCoinP,
    goblinPoints: account.GoblinPoints,
  };
}

export async function getOpenMuAccountSummary(loginName: string): Promise<AuthenticatedOpenMuAccount | null> {
  const adminAccounts = getConfiguredAdminUsernames();
  if (!pgPool || !pgHealthy) {
    const mem = memoryAccounts.get(loginName.trim().toLowerCase());
    if (!mem) return null;
    const isAdmin = Boolean(
      mem.isMasterAdmin ||
        mem.role === 'ADMIN' ||
        mem.role === 'SUPER_ADMIN' ||
        mem.state === 'GameMaster' ||
        adminAccounts.has(mem.loginName.toLowerCase())
    );
    return {
      id: mem.id,
      loginName: mem.loginName,
      email: mem.email,
      state: mem.state === 'Normal' || mem.state === 'GameMaster' ? 0 : 1,
      credits: mem.credits,
      vaultMoney: mem.vaultMoney,
      onlineMinutes: mem.onlineMinutes,
      exchangedOnlineHours: mem.exchangedOnlineHours,
      vipUntil: mem.vipUntil,
      isAdmin,
      role: isAdmin ? (mem.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN') : 'USER',
      wCoinC: mem.wCoinC,
      wCoinP: mem.wCoinP,
      goblinPoints: mem.goblinPoints,
    };
  }
  const result = await pgPool.query<{
    Id: string;
    LoginName: string;
    EMail: string;
    State: number;
    WCoinC: number;
    WCoinP: number;
    GoblinPoints: number;
    credits: number;
    vault_money: string | number;
    online_minutes: number;
    exchanged_online_hours: number;
    vip_until: Date | null;
    role: UserRole | null;
    is_master_admin: boolean | null;
  }>(
    `SELECT a."Id", a."LoginName", a."EMail", a."State", a."WCoinC", a."WCoinP", a."GoblinPoints",
            COALESCE(w.credits, 0)::int AS credits,
            COALESCE(w.vault_money, 0)::bigint AS vault_money,
            COALESCE(w.online_minutes, 0)::int AS online_minutes,
            COALESCE(w.exchanged_online_hours, 0)::int AS exchanged_online_hours,
            w.vip_until,
            w.role,
            w.is_master_admin
       FROM data."Account" a
       LEFT JOIN webshop_accounts w ON LOWER(w.login_name) = LOWER(a."LoginName")
      WHERE LOWER(a."LoginName") = LOWER($1) LIMIT 1`,
    [loginName]
  );
  const account = result.rows[0];
  if (!account) return null;
  const isAdmin = Boolean(
    adminAccounts.has(account.LoginName.toLowerCase()) ||
      account.State === 2 ||
      account.is_master_admin ||
      account.role === 'ADMIN' ||
      account.role === 'SUPER_ADMIN'
  );
  return {
    id: account.Id,
    loginName: account.LoginName,
    email: account.EMail,
    state: account.State === 2 ? 0 : account.State,
    credits: account.credits,
    vaultMoney: Number(account.vault_money ?? 0),
    onlineMinutes: Number(account.online_minutes ?? 0),
    exchangedOnlineHours: Number(account.exchanged_online_hours ?? 0),
    vipUntil: account.vip_until ? new Date(account.vip_until).toISOString() : null,
    isAdmin,
    role: isAdmin ? 'ADMIN' : 'USER',
    wCoinC: account.WCoinC,
    wCoinP: account.WCoinP,
    goblinPoints: account.GoblinPoints,
  };
}

export interface AdminAccountSummaryRecord {
  username: string;
  credits: number;
  vaultMoney: number;
  onlineMinutes?: number;
  exchangedOnlineHours?: number;
  wCoinC: number;
  vipUntil: string | null;
  isAdmin: boolean;
  role: UserRole;
  isOnline: boolean;
}

export async function listAdminAccounts(limit = 250): Promise<AdminAccountSummaryRecord[]> {
  const adminAccounts = getConfiguredAdminUsernames();
  if (!pgPool || !pgHealthy) {
    return Array.from(memoryAccounts.values())
      .slice(0, limit)
      .map((acc) => {
        const isAdmin = Boolean(
          acc.isMasterAdmin ||
            acc.role === 'ADMIN' ||
            acc.role === 'SUPER_ADMIN' ||
            acc.state === 'GameMaster' ||
            adminAccounts.has(acc.loginName.toLowerCase())
        );
        const stat = memoryMembStat.get(acc.loginName.toLowerCase());
        return {
          username: acc.loginName,
          credits: acc.credits,
          vaultMoney: acc.vaultMoney,
          wCoinC: acc.wCoinC,
          vipUntil: acc.vipUntil,
          isAdmin,
          role: isAdmin ? 'ADMIN' : 'USER',
          isOnline: stat?.ConnectStat === 1,
        };
      });
  }

  try {
    const res = await pgPool.query<{
      login_name: string;
      credits: number;
      vault_money: string | number;
      wcoinc: number;
      vip_until: Date | null;
      role: UserRole | null;
      is_master_admin: boolean | null;
      state: string | number | null;
    }>(
      `SELECT COALESCE(a."LoginName", w.login_name) AS login_name,
              COALESCE(w.credits, 0)::int AS credits,
              COALESCE(w.vault_money, 0)::bigint AS vault_money,
              COALESCE(a."WCoinC", w.wcoinc, 0)::int AS wcoinc,
              w.vip_until,
              w.role,
              w.is_master_admin,
              a."State" AS state
         FROM data."Account" a
         FULL OUTER JOIN webshop_accounts w ON LOWER(w.login_name) = LOWER(a."LoginName")
        ORDER BY COALESCE(w.credits, 0) DESC, COALESCE(a."LoginName", w.login_name) ASC
        LIMIT $1`,
      [limit]
    );
    return res.rows
      .filter((r) => Boolean(r.login_name))
      .map((r) => {
        const isAdmin = Boolean(
          adminAccounts.has(r.login_name.toLowerCase()) ||
            r.state === 2 ||
            r.state === 'GameMaster' ||
            r.is_master_admin ||
            r.role === 'ADMIN' ||
            r.role === 'SUPER_ADMIN'
        );
        return {
          username: r.login_name,
          credits: Number(r.credits || 0),
          vaultMoney: Number(r.vault_money || 0),
          wCoinC: Number(r.wcoinc || 0),
          vipUntil: r.vip_until ? new Date(r.vip_until).toISOString() : null,
          isAdmin,
          role: isAdmin ? 'ADMIN' : 'USER',
          isOnline: false,
        };
      });
  } catch {
    const res = await pgPool.query<{
      login_name: string;
      credits: number;
      vault_money: string | number;
      wcoinc: number;
      vip_until: Date | null;
      role: UserRole | null;
      is_master_admin: boolean | null;
    }>(
      `SELECT login_name, credits, vault_money, wcoinc, vip_until, role, is_master_admin
         FROM webshop_accounts
        ORDER BY credits DESC, login_name ASC
        LIMIT $1`,
      [limit]
    );
    return res.rows.map((r) => {
      const isAdmin = Boolean(
        adminAccounts.has(r.login_name.toLowerCase()) ||
          r.is_master_admin ||
          r.role === 'ADMIN' ||
          r.role === 'SUPER_ADMIN'
      );
      return {
        username: r.login_name,
        credits: Number(r.credits || 0),
        vaultMoney: Number(r.vault_money || 0),
        wCoinC: Number(r.wcoinc || 0),
        vipUntil: r.vip_until ? new Date(r.vip_until).toISOString() : null,
        isAdmin,
        role: isAdmin ? 'ADMIN' : 'USER',
        isOnline: false,
      };
    });
  }
}

export async function adminAdjustAccountBalance(params: {
  targetLoginName: string;
  creditsDelta?: number;
  vaultZenDelta?: number;
  adminLoginName: string;
  ipAddress: string;
}): Promise<AdminAccountSummaryRecord> {
  const cleanTarget = (params.targetLoginName || '').trim();
  if (!cleanTarget || !/^[a-zA-Z0-9_-]{3,20}$/.test(cleanTarget)) {
    throw new TransactionDomainError(
      'INVALID_ACCOUNT',
      400,
      'กรุณาระบุชื่อบัญชีผู้เล่นที่ถูกต้อง (3–20 ตัวอักษร)'
    );
  }

  const creditsDelta =
    typeof params.creditsDelta === 'number' && Number.isFinite(params.creditsDelta)
      ? Math.trunc(params.creditsDelta)
      : 0;
  const vaultZenDelta =
    typeof params.vaultZenDelta === 'number' && Number.isFinite(params.vaultZenDelta)
      ? Math.trunc(params.vaultZenDelta)
      : 0;

  if (creditsDelta === 0 && vaultZenDelta === 0) {
    throw new TransactionDomainError(
      'INVALID_DELTA',
      400,
      'กรุณาระบุจำนวนเครดิตหรือจำนวนเงิน Zen ที่ต้องการปรับ (ต้องไม่เป็น 0)'
    );
  }

  const MAX_VAULT_ZEN = 900_000_000;
  const adminAccounts = getConfiguredAdminUsernames();

  if (!pgPool || !pgHealthy) {
    return await withAccountMutex(cleanTarget, async () => {
      const key = cleanTarget.toLowerCase();
      let mem = memoryAccounts.get(key);
      if (!mem) {
        const isAdmin = adminAccounts.has(key);
        mem = {
          id: crypto.randomUUID(),
          loginName: cleanTarget,
          passwordPlainOrSimulatedBcrypt: '123456',
          passwordHash: hashSimulatedBcrypt('123456'),
          securityCode: '0000000',
          email: `${cleanTarget}@muorigins.online`,
          state: isAdmin ? 'GameMaster' : 'Normal',
          role: isAdmin ? 'ADMIN' : 'USER',
          isMasterAdmin: isAdmin,
          registrationDate: new Date().toISOString(),
          credits: 0,
          vaultMoney: 0,
          onlineMinutes: 0,
          exchangedOnlineHours: 0,
          wCoinC: 0,
          wCoinP: 0,
          goblinPoints: 0,
          vipUntil: null,
          vaultItems: [],
        };
        memoryAccounts.set(key, mem);
      }

      if (creditsDelta !== 0) {
        mem.credits = Math.max(0, mem.credits + creditsDelta);
      }
      if (vaultZenDelta !== 0) {
        mem.vaultMoney = Math.min(MAX_VAULT_ZEN, Math.max(0, mem.vaultMoney + vaultZenDelta));
      }

      await recordAuditLog({
        accountId: mem.loginName,
        ipAddress: params.ipAddress,
        action: creditsDelta !== 0 ? 'ADMIN_ADJUST_CREDITS' : 'ADMIN_ADJUST_VAULT_ZEN',
        status: 'COMMITTED',
        creditsDelta,
        details:
          creditsDelta !== 0
            ? `Admin "${params.adminLoginName}" adjusted ${mem.loginName}'s credits by ${
                creditsDelta >= 0 ? `+${creditsDelta.toLocaleString()}` : creditsDelta.toLocaleString()
              } (Total: ${mem.credits.toLocaleString()} Cr)`
            : `Admin "${params.adminLoginName}" adjusted ${mem.loginName}'s Vault Zen by ${
                vaultZenDelta >= 0 ? `+${vaultZenDelta.toLocaleString()}` : vaultZenDelta.toLocaleString()
              } (Total: ${mem.vaultMoney.toLocaleString()} Zen)`,
      });

      const isAdmin = Boolean(
        mem.isMasterAdmin ||
          mem.role === 'ADMIN' ||
          mem.role === 'SUPER_ADMIN' ||
          mem.state === 'GameMaster' ||
          adminAccounts.has(key)
      );
      return {
        username: mem.loginName,
        credits: mem.credits,
        vaultMoney: mem.vaultMoney,
        wCoinC: mem.wCoinC,
        vipUntil: mem.vipUntil,
        isAdmin,
        role: isAdmin ? 'ADMIN' : 'USER',
        isOnline: memoryMembStat.get(key)?.ConnectStat === 1,
      };
    });
  }

  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');

    // Sync from OpenMU data."Account" into webshop_accounts if the account exists in OpenMU
    await client.query('SAVEPOINT sp_openmu_lookup');
    try {
      const openMuRes = await client.query<{
        Id: string;
        LoginName: string;
        EMail: string;
        State: number;
        WCoinC: number;
        WCoinP: number;
        GoblinPoints: number;
      }>(
        `SELECT "Id", "LoginName", "EMail", "State", "WCoinC", "WCoinP", "GoblinPoints"
           FROM data."Account"
          WHERE LOWER("LoginName") = LOWER($1)
          LIMIT 1`,
        [cleanTarget]
      );
      const oa = openMuRes.rows[0];
      if (oa) {
        const isCfgAdmin = adminAccounts.has(oa.LoginName.toLowerCase()) || oa.State === 2;
        await client.query(
          `INSERT INTO webshop_accounts (
             id, login_name, password_hash, security_code, email, state, role, is_master_admin,
             credits, vault_money, wcoinc, wcoinp, goblin_points
           ) VALUES ($1, $2, '', '', $3, $4, $5, $6, 0, 0, $7, $8, $9)
           ON CONFLICT (login_name) DO NOTHING`,
          [
            oa.Id,
            oa.LoginName,
            oa.EMail || `${oa.LoginName}@muorigins.online`,
            String(oa.State),
            isCfgAdmin ? 'ADMIN' : 'USER',
            isCfgAdmin,
            oa.WCoinC || 0,
            oa.WCoinP || 0,
            oa.GoblinPoints || 0,
          ]
        );
      }
      await client.query('RELEASE SAVEPOINT sp_openmu_lookup');
    } catch {
      await client.query('ROLLBACK TO SAVEPOINT sp_openmu_lookup');
    }

    const lockRes = await client.query<{
      login_name: string;
      credits: number;
      vault_money: string | number;
      wcoinc: number;
      vip_until: Date | null;
      role: UserRole;
      is_master_admin: boolean;
    }>(
      `SELECT login_name, credits, vault_money, wcoinc, vip_until, role, is_master_admin
         FROM webshop_accounts
        WHERE LOWER(login_name) = LOWER($1)
        FOR UPDATE`,
      [cleanTarget]
    );

    const existing = lockRes.rows[0];
    if (!existing) {
      throw new TransactionDomainError(
        'ACCOUNT_NOT_FOUND',
        404,
        `ไม่พบบัญชีผู้เล่น "${cleanTarget}" ในฐานข้อมูล OpenMU`
      );
    }

    const updatedCredits =
      creditsDelta !== 0
        ? Math.max(0, Number(existing.credits || 0) + creditsDelta)
        : Number(existing.credits || 0);
    const updatedVaultMoney =
      vaultZenDelta !== 0
        ? Math.min(MAX_VAULT_ZEN, Math.max(0, Number(existing.vault_money || 0) + vaultZenDelta))
        : Number(existing.vault_money || 0);

    const updRes = await client.query<{
      login_name: string;
      credits: number;
      vault_money: string | number;
      wcoinc: number;
      vip_until: Date | null;
      role: UserRole;
      is_master_admin: boolean;
    }>(
      `UPDATE webshop_accounts
          SET credits = $1,
              vault_money = $2,
              updated_at = NOW()
        WHERE login_name = $3
        RETURNING login_name, credits, vault_money, wcoinc, vip_until, role, is_master_admin`,
      [updatedCredits, updatedVaultMoney, existing.login_name]
    );

    // If OpenMU data."ItemStorage" is linked via data."Account"."VaultId", sync Money into OpenMU vault
    if (vaultZenDelta !== 0) {
      await client.query('SAVEPOINT sp_openmu_vault_zen');
      try {
        await client.query(
          `UPDATE data."ItemStorage"
              SET "Money" = $1
            WHERE "Id" = (
              SELECT "VaultId"
                FROM data."Account"
               WHERE LOWER("LoginName") = LOWER($2)
                 AND "VaultId" IS NOT NULL
               LIMIT 1
            )`,
          [updatedVaultMoney, existing.login_name]
        );
        await client.query('RELEASE SAVEPOINT sp_openmu_vault_zen');
      } catch {
        await client.query('ROLLBACK TO SAVEPOINT sp_openmu_vault_zen');
      }
    }

    await recordAuditLog(
      {
        accountId: existing.login_name,
        ipAddress: params.ipAddress,
        action: creditsDelta !== 0 ? 'ADMIN_ADJUST_CREDITS' : 'ADMIN_ADJUST_VAULT_ZEN',
        status: 'COMMITTED',
        creditsDelta,
        details:
          creditsDelta !== 0
            ? `Admin "${params.adminLoginName}" adjusted ${existing.login_name}'s credits by ${
                creditsDelta >= 0 ? `+${creditsDelta.toLocaleString()}` : creditsDelta.toLocaleString()
              } (Total: ${updatedCredits.toLocaleString()} Cr)`
            : `Admin "${params.adminLoginName}" adjusted ${existing.login_name}'s Vault Zen by ${
                vaultZenDelta >= 0 ? `+${vaultZenDelta.toLocaleString()}` : vaultZenDelta.toLocaleString()
              } (Total: ${updatedVaultMoney.toLocaleString()} Zen)`,
      },
      client
    );

    await client.query('COMMIT');
    const row = updRes.rows[0];
    const isAdmin = Boolean(
      adminAccounts.has(row.login_name.toLowerCase()) ||
        row.is_master_admin ||
        row.role === 'ADMIN' ||
        row.role === 'SUPER_ADMIN'
    );
    return {
      username: row.login_name,
      credits: Number(row.credits),
      vaultMoney: Number(row.vault_money),
      wCoinC: Number(row.wcoinc),
      vipUntil: row.vip_until ? new Date(row.vip_until).toISOString() : null,
      isAdmin,
      role: isAdmin ? 'ADMIN' : 'USER',
      isOnline: false,
    };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

// ============================================================================
// Online Time Exchange & Character Delete / Buy / Reset (Server-Authoritative)
// ============================================================================
export async function redeemAccountOnlineHours(params: {
  loginName: string;
  hoursToRedeem: number;
  ipAddress: string;
}): Promise<{
  ok: true;
  hoursRedeemed: number;
  creditsAdded: number;
  credits: number;
  onlineMinutes: number;
  exchangedOnlineHours: number;
}> {
  const cleanLogin = (params.loginName || '').trim();
  const hours = Math.trunc(Number(params.hoursToRedeem));
  if (!cleanLogin) {
    throw new TransactionDomainError('UNAUTHORIZED', 401, 'กรุณาเข้าสู่ระบบก่อนทำรายการ');
  }
  if (!Number.isInteger(hours) || hours < 1 || hours > 1000) {
    throw new TransactionDomainError(
      'INVALID_HOURS',
      400,
      'จำนวนชั่วโมงที่ต้องการแลกต้องเป็นจำนวนเต็มตั้งแต่ 1 ชั่วโมงขึ้นไป'
    );
  }

  const minutesRequired = hours * 60;
  const creditsReward = hours * ONLINE_HOUR_REWARD_CREDITS;

  if (!pgPool || !pgHealthy) {
    return await withAccountMutex(cleanLogin, async () => {
      const mem = memoryAccounts.get(cleanLogin.toLowerCase());
      if (!mem) {
        throw new TransactionDomainError('ACCOUNT_NOT_FOUND', 404, 'ไม่พบบัญชีผู้เล่นในระบบ');
      }
      const availableHours = Math.floor((mem.onlineMinutes || 0) / 60);
      if (hours > availableHours || mem.onlineMinutes < minutesRequired) {
        throw new TransactionDomainError(
          'INSUFFICIENT_ONLINE_HOURS',
          400,
          `เวลาออนไลน์สะสมไม่เพียงพอ (มี ${availableHours} ชั่วโมงเต็ม ต้องการ ${hours} ชั่วโมง)`
        );
      }

      mem.onlineMinutes = Math.max(0, mem.onlineMinutes - minutesRequired);
      mem.exchangedOnlineHours = (mem.exchangedOnlineHours || 0) + hours;
      mem.credits += creditsReward;

      await recordAuditLog({
        accountId: mem.loginName,
        ipAddress: params.ipAddress,
        action: 'ONLINE_TIME_EXCHANGE',
        status: 'COMMITTED',
        creditsDelta: creditsReward,
        details: `Exchanged ${hours} online hour(s) (${minutesRequired} mins) for +${creditsReward} Credits (Remaining: ${mem.onlineMinutes} mins)`,
      });

      return {
        ok: true,
        hoursRedeemed: hours,
        creditsAdded: creditsReward,
        credits: mem.credits,
        onlineMinutes: mem.onlineMinutes,
        exchangedOnlineHours: mem.exchangedOnlineHours,
      };
    });
  }

  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');
    const lockRes = await client.query<{
      login_name: string;
      credits: number;
      online_minutes: number;
      exchanged_online_hours: number;
    }>(
      `SELECT login_name, credits, online_minutes, exchanged_online_hours
         FROM webshop_accounts
        WHERE LOWER(login_name) = LOWER($1)
        FOR UPDATE`,
      [cleanLogin]
    );
    const acc = lockRes.rows[0];
    if (!acc) {
      throw new TransactionDomainError('ACCOUNT_NOT_FOUND', 404, 'ไม่พบบัญชีผู้เล่นในระบบ');
    }

    const availableHours = Math.floor(Number(acc.online_minutes || 0) / 60);
    if (hours > availableHours || Number(acc.online_minutes || 0) < minutesRequired) {
      throw new TransactionDomainError(
        'INSUFFICIENT_ONLINE_HOURS',
        400,
        `เวลาออนไลน์สะสมไม่เพียงพอ (มี ${availableHours} ชั่วโมงเต็ม ต้องการ ${hours} ชั่วโมง)`
      );
    }

    const updRes = await client.query<{
      credits: number;
      online_minutes: number;
      exchanged_online_hours: number;
    }>(
      `UPDATE webshop_accounts
          SET online_minutes = online_minutes - $1,
              exchanged_online_hours = exchanged_online_hours + $2,
              credits = credits + $3,
              updated_at = NOW()
        WHERE login_name = $4
          AND online_minutes >= $1
        RETURNING credits, online_minutes, exchanged_online_hours`,
      [minutesRequired, hours, creditsReward, acc.login_name]
    );
    const row = updRes.rows[0];
    if (!row) {
      throw new TransactionDomainError(
        'INSUFFICIENT_ONLINE_HOURS',
        409,
        'ไม่สามารถแลกเวลาออนไลน์ได้ กรุณาลองใหม่อีกครั้ง'
      );
    }

    await recordAuditLog(
      {
        accountId: acc.login_name,
        ipAddress: params.ipAddress,
        action: 'ONLINE_TIME_EXCHANGE',
        status: 'COMMITTED',
        creditsDelta: creditsReward,
        details: `Exchanged ${hours} online hour(s) (${minutesRequired} mins) for +${creditsReward} Credits`,
      },
      client
    );

    await client.query('COMMIT');
    return {
      ok: true,
      hoursRedeemed: hours,
      creditsAdded: creditsReward,
      credits: Number(row.credits),
      onlineMinutes: Number(row.online_minutes),
      exchangedOnlineHours: Number(row.exchanged_online_hours),
    };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function getAccountCharacters(loginName: string): Promise<Character[]> {
  const cleanLogin = (loginName || '').trim();
  if (!cleanLogin) return [];

  if (!pgPool || !pgHealthy) {
    return Array.from(memoryCharacters.values()).filter(
      (c) => c.accountId.toLowerCase() === cleanLogin.toLowerCase()
    );
  }

  const byName = new Map<string, Character>();

  // 1. Query webshop_characters table
  try {
    const wsRes = await pgPool.query<{
      name: string;
      account_login: string;
      class_code: string;
      class_id: number;
      level: number;
      resets: number;
      level_up_points: number;
      strength: number;
      agility: number;
      vitality: number;
      energy: number;
      command: number;
      money: string | number;
      ctl_code: number;
    }>(
      `SELECT name, account_login, class_code, class_id, level, resets, level_up_points,
              strength, agility, vitality, energy, command, money, ctl_code
         FROM webshop_characters
        WHERE LOWER(account_login) = LOWER($1)
        ORDER BY level DESC, name ASC`,
      [cleanLogin]
    );
    for (const r of wsRes.rows) {
      byName.set(r.name.toLowerCase(), {
        name: r.name,
        accountId: r.account_login,
        classCode: (r.class_code as MuClassCode) || 'bm',
        classId: Number(r.class_id || 18),
        level: Number(r.level || 400),
        resets: Number(r.resets || 0),
        levelUpPoints: Number(r.level_up_points || 0),
        strength: Number(r.strength || 28),
        agility: Number(r.agility || 20),
        vitality: Number(r.vitality || 25),
        energy: Number(r.energy || 10),
        command: Number(r.command || 0),
        money: Number(r.money || 0),
        ctlCode: Number(r.ctl_code || 0),
        isOnline: false,
      });
    }
  } catch {
    // ignore if table not ready
  }

  // 2. Query OpenMU data."Character" if available
  try {
    const omuRes = await pgPool.query<{
      Name: string;
      LoginName: string;
      CharacterStatus: number;
      LevelUpPoints: number;
      ClassNumber: number | null;
      Level: number | null;
      Money: number | null;
    }>(
      `SELECT c."Name",
              a."LoginName",
              COALESCE(c."CharacterStatus", 0)::int AS "CharacterStatus",
              COALESCE(c."LevelUpPoints", 0)::int AS "LevelUpPoints",
              cc."Number" AS "ClassNumber",
              COALESCE(
                (SELECT MAX(sa."Value")::int
                   FROM data."StatAttribute" sa
                   JOIN config."AttributeDefinition" ad ON ad."Id" = sa."DefinitionId"
                  WHERE sa."CharacterId" = c."Id"
                    AND LOWER(ad."Designation") LIKE '%level%'),
                400
              ) AS "Level",
              COALESCE(inv."Money", 0)::bigint AS "Money"
         FROM data."Character" c
         JOIN data."Account" a ON a."Id" = c."AccountId"
         LEFT JOIN config."CharacterClass" cc ON cc."Id" = c."CharacterClassId"
         LEFT JOIN data."ItemStorage" inv ON inv."Id" = c."InventoryId"
        WHERE LOWER(a."LoginName") = LOWER($1)
        ORDER BY c."CharacterSlot" ASC`,
      [cleanLogin]
    );
    for (const r of omuRes.rows) {
      const matchedClass =
        MU_CLASSES.find((m) => m.id === Number(r.ClassNumber)) || MU_CLASSES[2];
      const level = Math.max(1, Math.min(400, Number(r.Level || 400)));
      const calc = calculateClassStatPoints(matchedClass.code, level);
      byName.set(r.Name.toLowerCase(), {
        name: r.Name,
        accountId: r.LoginName,
        classCode: matchedClass.code,
        classId: matchedClass.id,
        level,
        resets: 0,
        levelUpPoints: Number(r.LevelUpPoints ?? calc.totalPoints),
        strength: calc.classDef.baseStr,
        agility: calc.classDef.baseAgi,
        vitality: calc.classDef.baseVit,
        energy: calc.classDef.baseEne,
        command: calc.classDef.baseCmd,
        money: Number(r.Money || 0),
        ctlCode: Number(r.CharacterStatus || 0),
        isOnline: false,
      });
    }
  } catch {
    // OpenMU Character schema may not have StatAttribute or custom tables in all deployments
  }

  return Array.from(byName.values());
}

export async function buyCharacter400Tx(params: {
  loginName: string;
  characterName: string;
  classCode: MuClassCode;
  ipAddress: string;
}): Promise<{
  ok: true;
  character: Character;
  remainingCredits: number;
  characters: Character[];
}> {
  const cleanLogin = (params.loginName || '').trim();
  const cleanCharName = (params.characterName || '').trim();
  if (!cleanLogin) {
    throw new TransactionDomainError('UNAUTHORIZED', 401, 'กรุณาเข้าสู่ระบบก่อนทำรายการ');
  }
  if (!/^[a-zA-Z0-9_-]{2,10}$/.test(cleanCharName)) {
    throw new TransactionDomainError(
      'INVALID_CHAR_NAME',
      400,
      'ชื่อตัวละครต้องเป็นภาษาอังกฤษหรือตัวเลข ความยาว 2–10 ตัวอักษร'
    );
  }

  const calc = calculateClassStatPoints(params.classCode, 400);
  if (!calc.classDef.s3) {
    throw new TransactionDomainError(
      'INVALID_CLASS',
      400,
      'อนุญาตให้ซื้อเฉพาะสายอาชีพ Class 3 เท่านั้น'
    );
  }
  const cost = BUY_CHAR_400_CREDITS;

  if (!pgPool || !pgHealthy) {
    return await withAccountMutex(cleanLogin, async () => {
      const mem = memoryAccounts.get(cleanLogin.toLowerCase());
      if (!mem) {
        throw new TransactionDomainError('ACCOUNT_NOT_FOUND', 404, 'ไม่พบบัญชีผู้เล่นในระบบ');
      }
      if (memoryMembStat.get(cleanLogin.toLowerCase())?.ConnectStat === 1) {
        throw new TransactionDomainError(
          'ACCOUNT_ONLINE',
          409,
          'บัญชีต้องอยู่ในสถานะออฟไลน์ (Offline) ก่อนซื้อตัวละครใหม่'
        );
      }
      const existingChars = Array.from(memoryCharacters.values()).filter(
        (c) => c.accountId.toLowerCase() === cleanLogin.toLowerCase()
      );
      if (existingChars.length >= 5) {
        throw new TransactionDomainError(
          'MAX_CHARACTERS_REACHED',
          400,
          'บัญชีของคุณมีตัวละครครบสูงสุด 5 ตัวแล้ว'
        );
      }
      if (memoryCharacters.has(cleanCharName.toLowerCase())) {
        throw new TransactionDomainError(
          'CHAR_NAME_TAKEN',
          409,
          `ชื่อตัวละคร "${cleanCharName}" มีอยู่ในระบบแล้ว`
        );
      }
      if (mem.credits < cost) {
        throw new TransactionDomainError(
          'INSUFFICIENT_CREDITS',
          402,
          `เครดิตไม่เพียงพอ (ต้องการ ${cost.toLocaleString()} Credits)`
        );
      }

      const newChar: Character = {
        name: cleanCharName,
        accountId: mem.loginName,
        classCode: calc.classDef.code,
        classId: calc.classDef.id,
        level: 400,
        resets: 0,
        levelUpPoints: calc.totalPoints,
        strength: calc.classDef.baseStr,
        agility: calc.classDef.baseAgi,
        vitality: calc.classDef.baseVit,
        energy: calc.classDef.baseEne,
        command: calc.classDef.baseCmd,
        money: 0,
        ctlCode: 0,
        isOnline: false,
      };
      mem.credits -= cost;
      memoryCharacters.set(cleanCharName.toLowerCase(), newChar);

      await recordAuditLog({
        accountId: mem.loginName,
        ipAddress: params.ipAddress,
        action: 'BUY_CHARACTER_400',
        status: 'COMMITTED',
        creditsDelta: -cost,
        details: `Purchased Lv.400 character "${cleanCharName}" (${calc.classDef.name}) for ${cost} Credits`,
      });

      return {
        ok: true,
        character: newChar,
        remainingCredits: mem.credits,
        characters: await getAccountCharacters(mem.loginName),
      };
    });
  }

  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');

    const membRes = await client.query<{ ConnectStat: number }>(
      `SELECT "ConnectStat" FROM "MEMB_STAT" WHERE LOWER("memb___id") = LOWER($1) FOR SHARE`,
      [cleanLogin]
    );
    if (membRes.rows[0]?.ConnectStat === 1) {
      throw new TransactionDomainError(
        'ACCOUNT_ONLINE',
        409,
        'บัญชีต้องอยู่ในสถานะออฟไลน์ (Offline) ก่อนซื้อตัวละครใหม่'
      );
    }

    const lockAcc = await client.query<{ login_name: string; credits: number }>(
      `SELECT login_name, credits FROM webshop_accounts WHERE LOWER(login_name) = LOWER($1) FOR UPDATE`,
      [cleanLogin]
    );
    const acc = lockAcc.rows[0];
    if (!acc) {
      throw new TransactionDomainError('ACCOUNT_NOT_FOUND', 404, 'ไม่พบบัญชีผู้เล่นในระบบ');
    }
    if (acc.credits < cost) {
      throw new TransactionDomainError(
        'INSUFFICIENT_CREDITS',
        402,
        `เครดิตไม่เพียงพอ (ต้องการ ${cost.toLocaleString()} Credits)`
      );
    }

    const cntRes = await client.query<{ cnt: string }>(
      `SELECT COUNT(*)::text AS cnt FROM webshop_characters WHERE LOWER(account_login) = LOWER($1)`,
      [acc.login_name]
    );
    if (Number(cntRes.rows[0]?.cnt || 0) >= 5) {
      throw new TransactionDomainError(
        'MAX_CHARACTERS_REACHED',
        400,
        'บัญชีของคุณมีตัวละครครบสูงสุด 5 ตัวแล้ว'
      );
    }

    const dupRes = await client.query<{ name: string }>(
      `SELECT name FROM webshop_characters WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      [cleanCharName]
    );
    if (dupRes.rows[0]) {
      throw new TransactionDomainError(
        'CHAR_NAME_TAKEN',
        409,
        `ชื่อตัวละคร "${cleanCharName}" มีอยู่ในระบบแล้ว`
      );
    }

    const updAcc = await client.query<{ credits: number }>(
      `UPDATE webshop_accounts SET credits = credits - $1, updated_at = NOW()
        WHERE login_name = $2 AND credits >= $1 RETURNING credits`,
      [cost, acc.login_name]
    );

    await client.query(
      `INSERT INTO webshop_characters (
         name, account_login, class_code, class_id, level, resets, level_up_points,
         strength, agility, vitality, energy, command, money, ctl_code
       ) VALUES ($1, $2, $3, $4, 400, 0, $5, $6, $7, $8, $9, $10, 0, 0)`,
      [
        cleanCharName,
        acc.login_name,
        calc.classDef.code,
        calc.classDef.id,
        calc.totalPoints,
        calc.classDef.baseStr,
        calc.classDef.baseAgi,
        calc.classDef.baseVit,
        calc.classDef.baseEne,
        calc.classDef.baseCmd,
      ]
    );

    await recordAuditLog(
      {
        accountId: acc.login_name,
        ipAddress: params.ipAddress,
        action: 'BUY_CHARACTER_400',
        status: 'COMMITTED',
        creditsDelta: -cost,
        details: `Purchased Lv.400 character "${cleanCharName}" (${calc.classDef.name}) for ${cost} Credits`,
      },
      client
    );

    await client.query('COMMIT');
    const newChar: Character = {
      name: cleanCharName,
      accountId: acc.login_name,
      classCode: calc.classDef.code,
      classId: calc.classDef.id,
      level: 400,
      resets: 0,
      levelUpPoints: calc.totalPoints,
      strength: calc.classDef.baseStr,
      agility: calc.classDef.baseAgi,
      vitality: calc.classDef.baseVit,
      energy: calc.classDef.baseEne,
      command: calc.classDef.baseCmd,
      money: 0,
      ctlCode: 0,
      isOnline: false,
    };
    return {
      ok: true,
      character: newChar,
      remainingCredits: Number(updAcc.rows[0]?.credits ?? 0),
      characters: await getAccountCharacters(acc.login_name),
    };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteCharacter400ForCredits(params: {
  loginName: string;
  characterName: string;
  deleteCode: string;
  ipAddress: string;
}): Promise<{
  ok: true;
  deletedCharacterName: string;
  rewardCredits: number;
  remainingCredits: number;
  characters: Character[];
}> {
  const cleanLogin = (params.loginName || '').trim();
  const cleanCharName = (params.characterName || '').trim();
  const cleanCode = (params.deleteCode || '').trim();

  if (!cleanLogin) {
    throw new TransactionDomainError('UNAUTHORIZED', 401, 'กรุณาเข้าสู่ระบบก่อนทำรายการ');
  }
  if (!cleanCharName) {
    throw new TransactionDomainError('INVALID_CHAR_NAME', 400, 'กรุณาเลือกตัวละครที่ต้องการลบ');
  }
  if (!cleanCode || cleanCode.length < 4 || cleanCode.length > 32) {
    throw new TransactionDomainError(
      'INVALID_DELETE_CODE',
      400,
      'กรุณากรอกรหัสลบตัวละคร (Security Code) หรือรหัสผ่านบัญชีเพื่อยืนยัน'
    );
  }

  const reward = DELETE_CHAR_400_REWARD_CREDITS;

  if (!pgPool || !pgHealthy) {
    return await withAccountMutex(cleanLogin, async () => {
      const mem = memoryAccounts.get(cleanLogin.toLowerCase());
      if (!mem) {
        throw new TransactionDomainError('ACCOUNT_NOT_FOUND', 404, 'ไม่พบบัญชีผู้เล่นในระบบ');
      }
      if (memoryMembStat.get(cleanLogin.toLowerCase())?.ConnectStat === 1) {
        throw new TransactionDomainError(
          'ACCOUNT_ONLINE',
          409,
          'บัญชีต้องอยู่ในสถานะออฟไลน์ (Offline) ก่อนลบตัวละคร'
        );
      }

      const codeMatchesSecurity =
        !mem.securityCode ||
        mem.securityCode === '0000000' ||
        mem.securityCode === cleanCode;
      const codeMatchesPassword = verifyAccountPassword(
        mem.passwordHash,
        mem.passwordPlainOrSimulatedBcrypt,
        cleanCode
      );
      if (!codeMatchesSecurity && !codeMatchesPassword) {
        throw new TransactionDomainError(
          'INVALID_DELETE_CODE',
          403,
          'รหัสสำหรับลบตัวละคร (หรือรหัสผ่านบัญชี) ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง'
        );
      }

      const targetChar = memoryCharacters.get(cleanCharName.toLowerCase());
      if (
        !targetChar ||
        targetChar.accountId.toLowerCase() !== cleanLogin.toLowerCase()
      ) {
        throw new TransactionDomainError(
          'CHAR_NOT_FOUND',
          404,
          'ไม่พบตัวละครนี้ในบัญชีของคุณ'
        );
      }
      if (targetChar.ctlCode !== 0) {
        throw new TransactionDomainError(
          'CHAR_BANNED',
          403,
          'ไม่สามารถลบตัวละครที่ติดสถานะแบนเพื่อแลกเครดิตได้'
        );
      }
      if (targetChar.level !== 400) {
        throw new TransactionDomainError(
          'CHAR_LEVEL_NOT_400',
          400,
          `ตัวละคร "${targetChar.name}" มีเลเวล ${targetChar.level} (ต้องเป็นเลเวล 400 เท่านั้น)`
        );
      }

      memoryCharacters.delete(cleanCharName.toLowerCase());
      mem.credits += reward;

      await recordAuditLog({
        accountId: mem.loginName,
        ipAddress: params.ipAddress,
        action: 'DELETE_CHARACTER_400',
        status: 'COMMITTED',
        creditsDelta: reward,
        details: `Deleted Lv.400 character "${targetChar.name}" in exchange for +${reward} Credits`,
      });

      return {
        ok: true,
        deletedCharacterName: targetChar.name,
        rewardCredits: reward,
        remainingCredits: mem.credits,
        characters: await getAccountCharacters(mem.loginName),
      };
    });
  }

  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');

    const membRes = await client.query<{ ConnectStat: number }>(
      `SELECT "ConnectStat" FROM "MEMB_STAT" WHERE LOWER("memb___id") = LOWER($1) FOR SHARE`,
      [cleanLogin]
    );
    if (membRes.rows[0]?.ConnectStat === 1) {
      throw new TransactionDomainError(
        'ACCOUNT_ONLINE',
        409,
        'บัญชีต้องอยู่ในสถานะออฟไลน์ (Offline) ก่อนลบตัวละคร'
      );
    }

    const lockAcc = await client.query<{
      login_name: string;
      security_code: string;
      credits: number;
    }>(
      `SELECT login_name, security_code, credits
         FROM webshop_accounts
        WHERE LOWER(login_name) = LOWER($1)
        FOR UPDATE`,
      [cleanLogin]
    );
    const acc = lockAcc.rows[0];
    if (!acc) {
      throw new TransactionDomainError('ACCOUNT_NOT_FOUND', 404, 'ไม่พบบัญชีผู้เล่นในระบบ');
    }

    // Verify Security Code or Account Password against OpenMU data."Account" and webshop_accounts
    let codeVerified = false;
    if (
      acc.security_code &&
      acc.security_code !== '0000000' &&
      acc.security_code === cleanCode
    ) {
      codeVerified = true;
    }

    await client.query('SAVEPOINT sp_verify_openmu_code');
    try {
      const omuAccRes = await client.query<{
        SecurityCode: string | null;
        PasswordHash: string | null;
      }>(
        `SELECT "SecurityCode", "PasswordHash"
           FROM data."Account"
          WHERE LOWER("LoginName") = LOWER($1)
          LIMIT 1`,
        [cleanLogin]
      );
      const omuAcc = omuAccRes.rows[0];
      if (omuAcc) {
        if (omuAcc.SecurityCode && omuAcc.SecurityCode.trim() !== '') {
          if (omuAcc.SecurityCode.trim() === cleanCode) {
            codeVerified = true;
          }
        } else if (!acc.security_code || acc.security_code === '0000000') {
          // If neither OpenMU nor webshop_accounts has a dedicated security code set, allow password or 4-8 digit confirmation
          codeVerified = true;
        }
        if (!codeVerified && omuAcc.PasswordHash) {
          if (await bcrypt.compare(cleanCode, omuAcc.PasswordHash)) {
            codeVerified = true;
          }
        }
      } else if (!acc.security_code || acc.security_code === '0000000') {
        codeVerified = true;
      }
      await client.query('RELEASE SAVEPOINT sp_verify_openmu_code');
    } catch {
      await client.query('ROLLBACK TO SAVEPOINT sp_verify_openmu_code');
      if (!acc.security_code || acc.security_code === '0000000') {
        codeVerified = true;
      }
    }

    if (!codeVerified) {
      throw new TransactionDomainError(
        'INVALID_DELETE_CODE',
        403,
        'รหัสสำหรับลบตัวละคร (Security Code หรือรหัสผ่านบัญชี) ไม่ถูกต้อง'
      );
    }

    // Locate character in webshop_characters or OpenMU data."Character"
    let deletedCharName = '';
    const wsCharRes = await client.query<{
      name: string;
      level: number;
      ctl_code: number;
    }>(
      `SELECT name, level, ctl_code
         FROM webshop_characters
        WHERE LOWER(account_login) = LOWER($1)
          AND LOWER(name) = LOWER($2)
        FOR UPDATE`,
      [acc.login_name, cleanCharName]
    );

    if (wsCharRes.rows[0]) {
      const ch = wsCharRes.rows[0];
      if (Number(ch.ctl_code) !== 0) {
        throw new TransactionDomainError(
          'CHAR_BANNED',
          403,
          'ไม่สามารถลบตัวละครที่ติดสถานะแบนเพื่อแลกเครดิตได้'
        );
      }
      if (Number(ch.level) !== 400) {
        throw new TransactionDomainError(
          'CHAR_LEVEL_NOT_400',
          400,
          `ตัวละคร "${ch.name}" มีเลเวล ${ch.level} (ต้องเป็นเลเวล 400 เท่านั้น)`
        );
      }
      await client.query(`DELETE FROM webshop_characters WHERE name = $1`, [ch.name]);
      deletedCharName = ch.name;
    }

    // Also check/delete from OpenMU data."Character" if present
    await client.query('SAVEPOINT sp_delete_openmu_char');
    try {
      const omuCharRes = await client.query<{
        Id: string;
        Name: string;
        CharacterStatus: number;
        Level: number;
      }>(
        `SELECT c."Id",
                c."Name",
                COALESCE(c."CharacterStatus", 0)::int AS "CharacterStatus",
                COALESCE(
                  (SELECT MAX(sa."Value")::int
                     FROM data."StatAttribute" sa
                     JOIN config."AttributeDefinition" ad ON ad."Id" = sa."DefinitionId"
                    WHERE sa."CharacterId" = c."Id"
                      AND LOWER(ad."Designation") LIKE '%level%'),
                  400
                ) AS "Level"
           FROM data."Character" c
           JOIN data."Account" a ON a."Id" = c."AccountId"
          WHERE LOWER(a."LoginName") = LOWER($1)
            AND LOWER(c."Name") = LOWER($2)
          LIMIT 1`,
        [acc.login_name, cleanCharName]
      );
      const omuChar = omuCharRes.rows[0];
      if (omuChar) {
        if (Number(omuChar.CharacterStatus) !== 0) {
          throw new TransactionDomainError(
            'CHAR_BANNED',
            403,
            'ไม่สามารถลบตัวละครที่ติดสถานะแบนเพื่อแลกเครดิตได้'
          );
        }
        if (Number(omuChar.Level) < 400) {
          throw new TransactionDomainError(
            'CHAR_LEVEL_NOT_400',
            400,
            `ตัวละคร "${omuChar.Name}" มีเลเวล ${omuChar.Level} (ต้องเป็นเลเวล 400 เท่านั้น)`
          );
        }
        await client.query(`DELETE FROM data."Character" WHERE "Id" = $1`, [omuChar.Id]);
        deletedCharName = omuChar.Name;
      }
      await client.query('RELEASE SAVEPOINT sp_delete_openmu_char');
    } catch (innerErr) {
      await client.query('ROLLBACK TO SAVEPOINT sp_delete_openmu_char');
      if (innerErr instanceof TransactionDomainError) {
        throw innerErr;
      }
    }

    if (!deletedCharName) {
      throw new TransactionDomainError(
        'CHAR_NOT_FOUND',
        404,
        'ไม่พบตัวละครเลเวล 400 ที่เลือกในบัญชีของคุณ'
      );
    }

    const updAcc = await client.query<{ credits: number }>(
      `UPDATE webshop_accounts
          SET credits = credits + $1,
              updated_at = NOW()
        WHERE login_name = $2
        RETURNING credits`,
      [reward, acc.login_name]
    );

    await recordAuditLog(
      {
        accountId: acc.login_name,
        ipAddress: params.ipAddress,
        action: 'DELETE_CHARACTER_400',
        status: 'COMMITTED',
        creditsDelta: reward,
        details: `Deleted Lv.400 character "${deletedCharName}" in exchange for +${reward} Credits`,
      },
      client
    );

    await client.query('COMMIT');
    return {
      ok: true,
      deletedCharacterName: deletedCharName,
      rewardCredits: reward,
      remainingCredits: Number(updAcc.rows[0]?.credits ?? 0),
      characters: await getAccountCharacters(acc.login_name),
    };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function reserveCreditExchange(loginName: string, credits: number, wCoinC: number, idempotencyKey: string): Promise<'pending' | 'completed'> {
  if (!pgPool || !pgHealthy) {
    const existing = memoryCreditExchanges.get(idempotencyKey);
    if (existing) {
      if (existing.account_login.toLowerCase() !== loginName.toLowerCase() || existing.credits_spent !== credits || existing.wcoinc_granted !== wCoinC) throw new Error('Idempotency key was already used for a different exchange.');
      return existing.status;
    }
    const mem = memoryAccounts.get(loginName.trim().toLowerCase());
    if (!mem || mem.credits < credits) throw new TransactionDomainError('INSUFFICIENT_CREDITS', 409, 'Not enough webshop credits.');
    mem.credits -= credits;
    memoryCreditExchanges.set(idempotencyKey, {
      status: 'pending',
      account_login: loginName,
      credits_spent: credits,
      wcoinc_granted: wCoinC,
    });
    return 'pending';
  }
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
  if (!pgPool || !pgHealthy) {
    const entry = memoryCreditExchanges.get(idempotencyKey);
    if (entry) {
      entry.status = 'completed';
      const mem = memoryAccounts.get(entry.account_login.trim().toLowerCase());
      if (mem) {
        mem.wCoinC += entry.wcoinc_granted;
      }
    }
    return;
  }
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
  if (pgPool && pgHealthy) {
    await pgPool.query(
      `INSERT INTO webshop_catalog_openmu_mappings
         (item_uid, package_sequence, price_sequence, item_json, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (item_uid) DO UPDATE SET
         package_sequence = EXCLUDED.package_sequence,
         price_sequence = EXCLUDED.price_sequence,
         item_json = EXCLUDED.item_json,
         updated_at = NOW()`,
      [item.uid, item.openMuPackageSequence ?? null, item.openMuPriceSequence ?? null, item]
    );
  }
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
  if (pgPool && pgHealthy) {
    await pgPool.query(
      'DELETE FROM webshop_catalog_openmu_mappings WHERE item_uid = $1',
      [uid]
    );
  }
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
      name: 'Mu Origins Explorer Pack',
      nameTh: 'แพ็กเกจนักผจญภัย Mu Origins',
      bonusTextTh: 'เรทมาตรฐาน',
      bonusTextEn: 'Standard Rate',
    },
    {
      amountThb: 100,
      bonusPercent: 3,
      code: 'PKG_100',
      name: 'Mu Origins Starter Pack',
      nameTh: 'แพ็กเกจผู้เริ่มต้น Mu Origins',
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
            name: String(p.name || `Mu Origins Pack ${priceThb} THB`).trim(),
            nameTh: String(p.nameTh || `แพ็กเกจ Mu Origins ${priceThb} บาท`).trim(),
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
    onlineMinutes: 0,
    exchangedOnlineHours: 0,
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
// AUTHORITATIVE OPENMU ITEM ORDER LEDGER
// ============================================================================

function validateAuthoritativeOrderReference(reference: string): string {
  const clean = reference.trim();
  if (!/^webshop:(?:order|vip):[A-Za-z0-9-]{8,100}$/.test(clean)) {
    throw new TransactionDomainError(
      'INVALID_IDEMPOTENCY_KEY',
      400,
      'A valid immutable Idempotency-Key is required.'
    );
  }
  return clean;
}

function getAuthoritativeCatalogItem(itemUid: number): WebShopItem {
  const item = serverCatalog.find((candidate) => candidate.uid === itemUid);
  if (!item) {
    throw new TransactionDomainError('ITEM_NOT_FOUND', 404, 'Catalog item not found.');
  }
  if (!Number.isInteger(item.openMuPackageSequence) || item.openMuPackageSequence! < 0) {
    throw new TransactionDomainError(
      'AUTHORITATIVE_OFFER_NOT_MAPPED',
      422,
      'This item is not mapped to an authoritative OpenMU cash shop offer.'
    );
  }
  if (!Number.isInteger(item.credits) || item.credits <= 0) {
    throw new TransactionDomainError('ITEM_NOT_FOR_SALE', 422, 'This item is not for sale.');
  }
  return item;
}

export async function reserveAuthoritativeItemOrder(params: {
  accountLogin: string;
  itemUid: number;
  reference: string;
}): Promise<AuthoritativeItemOrder> {
  const item = getAuthoritativeCatalogItem(params.itemUid);
  return reserveAuthoritativeOrder({
    accountLogin: params.accountLogin,
    reference: params.reference,
    itemUid: item.uid,
    packageSequence: item.openMuPackageSequence!,
    priceSequence: item.openMuPriceSequence ?? null,
    chargedCredits: item.credits,
  });
}

export async function reserveAuthoritativeVipOrder(params: {
  accountLogin: string;
  months: number;
  reference: string;
}): Promise<AuthoritativeItemOrder> {
  if (!Number.isInteger(params.months) || params.months < 1 || params.months > 12) {
    throw new TransactionDomainError('INVALID_VIP_DURATION', 422, 'VIP duration must be between 1 and 12 months.');
  }
  return reserveAuthoritativeOrder({
    accountLogin: params.accountLogin,
    reference: params.reference,
    itemUid: -1,
    packageSequence: -1,
    priceSequence: params.months * 30,
    chargedCredits: params.months * 800,
  });
}

async function reserveAuthoritativeOrder(params: {
  accountLogin: string;
  reference: string;
  itemUid: number;
  packageSequence: number;
  priceSequence: number | null;
  chargedCredits: number;
}): Promise<AuthoritativeItemOrder> {
  const accountLogin = params.accountLogin.trim();
  const reference = validateAuthoritativeOrderReference(params.reference);
  const { itemUid, packageSequence, priceSequence, chargedCredits } = params;

  if (pgPool && pgHealthy) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
      const existingResult = await client.query<{
        reference: string;
        account_login: string;
        item_uid: number;
        package_sequence: number;
        price_sequence: number | null;
        charged_credits: number;
        status: AuthoritativeItemOrder['status'];
        openmu_grant_id: string | null;
        failure_code: string | null;
        credits: number;
      }>(
        `SELECT o.*, a.credits
         FROM webshop_item_orders o
         JOIN webshop_accounts a ON LOWER(a.login_name) = LOWER(o.account_login)
         WHERE o.reference = $1
         FOR UPDATE OF o`,
        [reference]
      );
      const existing = existingResult.rows[0];
      if (existing) {
        if (
          existing.account_login.toLowerCase() !== accountLogin.toLowerCase() ||
          existing.item_uid !== itemUid ||
          existing.package_sequence !== packageSequence ||
          existing.price_sequence !== priceSequence ||
          existing.charged_credits !== chargedCredits
        ) {
          throw new TransactionDomainError(
            'IDEMPOTENCY_CONFLICT',
            409,
            'The Idempotency-Key is already bound to another order.'
          );
        }
        await client.query('COMMIT');
        return {
          reference: existing.reference,
          accountLogin: existing.account_login,
          itemUid: existing.item_uid,
          packageSequence: existing.package_sequence,
          priceSequence: existing.price_sequence,
          chargedCredits: existing.charged_credits,
          status: existing.status,
          openMuGrantId: existing.openmu_grant_id,
          failureCode: existing.failure_code,
          remainingCredits: existing.credits,
        };
      }

      const accountResult = await client.query<{ login_name: string; credits: number }>(
        `SELECT login_name, credits
         FROM webshop_accounts
         WHERE LOWER(login_name) = LOWER($1)
         FOR UPDATE`,
        [accountLogin]
      );
      const account = accountResult.rows[0];
      if (!account) {
        throw new TransactionDomainError('ACCOUNT_NOT_FOUND', 404, 'Account not found.');
      }
      if (account.credits < chargedCredits) {
        throw new TransactionDomainError('INSUFFICIENT_CREDITS', 402, 'Insufficient credits.');
      }
      const remainingCredits = account.credits - chargedCredits;
      await client.query(
        `UPDATE webshop_accounts SET credits = $2, updated_at = NOW() WHERE login_name = $1`,
        [account.login_name, remainingCredits]
      );
      await client.query(
        `INSERT INTO webshop_item_orders
           (reference, account_login, item_uid, package_sequence, price_sequence,
            charged_credits, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
        [reference, account.login_name, itemUid, packageSequence, priceSequence, chargedCredits]
      );
      await client.query('COMMIT');
      return {
        reference,
        accountLogin: account.login_name,
        itemUid,
        packageSequence,
        priceSequence,
        chargedCredits,
        status: 'pending',
        openMuGrantId: null,
        failureCode: null,
        remainingCredits,
      };
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  return withAccountMutex(accountLogin, async () => {
    const existing = memoryAuthoritativeItemOrders.get(reference);
    if (existing) {
      if (
        existing.accountLogin.toLowerCase() !== accountLogin.toLowerCase() ||
        existing.itemUid !== itemUid ||
        existing.packageSequence !== packageSequence ||
        existing.priceSequence !== priceSequence ||
        existing.chargedCredits !== chargedCredits
      ) {
        throw new TransactionDomainError(
          'IDEMPOTENCY_CONFLICT',
          409,
          'The Idempotency-Key is already bound to another order.'
        );
      }
      return { ...existing };
    }
    const account = memoryAccounts.get(accountLogin.toLowerCase());
    if (!account) throw new TransactionDomainError('ACCOUNT_NOT_FOUND', 404, 'Account not found.');
    if (account.credits < chargedCredits) {
      throw new TransactionDomainError('INSUFFICIENT_CREDITS', 402, 'Insufficient credits.');
    }
    account.credits -= chargedCredits;
    const order: AuthoritativeItemOrder = {
      reference,
      accountLogin: account.loginName,
      itemUid,
      packageSequence,
      priceSequence,
      chargedCredits,
      status: 'pending',
      openMuGrantId: null,
      failureCode: null,
      remainingCredits: account.credits,
    };
    memoryAuthoritativeItemOrders.set(reference, order);
    return { ...order };
  });
}

export async function completeAuthoritativeItemOrder(
  reference: string,
  openMuGrantId: string
): Promise<void> {
  if (pgPool && pgHealthy) {
    await pgPool.query(
      `UPDATE webshop_item_orders
       SET status = 'delivered', openmu_grant_id = $2, failure_code = NULL,
           updated_at = NOW()
       WHERE reference = $1 AND status IN ('pending', 'delivered')`,
      [reference, openMuGrantId]
    );
    return;
  }
  const order = memoryAuthoritativeItemOrders.get(reference);
  if (order && (order.status === 'pending' || order.status === 'delivered')) {
    order.status = 'delivered';
    order.openMuGrantId = openMuGrantId;
    order.failureCode = null;
  }
}

export async function completeAuthoritativeVipOrder(
  reference: string,
  openMuGrantId: string,
  vipUntil: string
): Promise<void> {
  const parsedVipUntil = new Date(vipUntil);
  if (!Number.isFinite(parsedVipUntil.getTime())) {
    throw new TransactionDomainError('INVALID_OPENMU_RESPONSE', 502, 'OpenMU returned an invalid VIP expiration.');
  }
  if (pgPool && pgHealthy) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query<{ account_login: string }>(
        `UPDATE webshop_item_orders
         SET status = 'delivered', openmu_grant_id = $2, failure_code = NULL,
             updated_at = NOW()
         WHERE reference = $1 AND status IN ('pending', 'delivered')
         RETURNING account_login`,
        [reference, openMuGrantId]
      );
      if (result.rows[0]) {
        await client.query(
          `UPDATE webshop_accounts SET vip_until = $2, updated_at = NOW()
           WHERE LOWER(login_name) = LOWER($1)`,
          [result.rows[0].account_login, parsedVipUntil]
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
    return;
  }
  const order = memoryAuthoritativeItemOrders.get(reference);
  if (order && (order.status === 'pending' || order.status === 'delivered')) {
    order.status = 'delivered';
    order.openMuGrantId = openMuGrantId;
    order.failureCode = null;
    const account = memoryAccounts.get(order.accountLogin.toLowerCase());
    if (account) account.vipUntil = parsedVipUntil.toISOString();
  }
}

export async function failAuthoritativeItemOrder(
  reference: string,
  failureCode: string,
  refund: boolean
): Promise<void> {
  if (pgPool && pgHealthy) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query<{ account_login: string; charged_credits: number }>(
        `UPDATE webshop_item_orders
         SET status = $2, failure_code = $3, updated_at = NOW()
         WHERE reference = $1 AND status = 'pending'
         RETURNING account_login, charged_credits`,
        [reference, refund ? 'rejected' : 'manual_review', failureCode]
      );
      if (refund && result.rows[0]) {
        await client.query(
          `UPDATE webshop_accounts
           SET credits = credits + $2, updated_at = NOW()
           WHERE LOWER(login_name) = LOWER($1)`,
          [result.rows[0].account_login, result.rows[0].charged_credits]
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
    return;
  }
  const order = memoryAuthoritativeItemOrders.get(reference);
  if (!order || order.status !== 'pending') return;
  order.status = refund ? 'rejected' : 'manual_review';
  order.failureCode = failureCode;
  if (refund) {
    const account = memoryAccounts.get(order.accountLogin.toLowerCase());
    if (account) {
      account.credits += order.chargedCredits;
      order.remainingCredits = account.credits;
    }
  }
}

// ============================================================================
// LEGACY DIRECT ITEM TRANSACTIONS (DISABLED BY HTTP ROUTING)
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
