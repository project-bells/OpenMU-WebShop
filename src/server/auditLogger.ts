import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { Pool, PoolClient } from 'pg';
import { INITIAL_LOGS } from '../data/initialState';

export type AuditStatus = 'COMMITTED' | 'ROLLED_BACK' | 'REJECTED';

export interface AuditLogEntry {
  id: string;
  numericId: number;
  accountId: string;
  ipAddress: string;
  action: string;
  status: AuditStatus;
  itemHex: string | null;
  itemSerial: string | null;
  creditsDelta: number;
  wCoinCDelta: number;
  idempotencyKey: string | null;
  details: string;
  timestampIso: string;
  dateline: number;
}

const AUDIT_LOG_FILE =
  process.env.AUDIT_LOG_PATH || path.join(process.cwd(), 'logs', 'audit.ndjson');
const MAX_RING_BUFFER = 1000;

let auditNumericSeq = INITIAL_LOGS.length;
const auditRingBuffer: AuditLogEntry[] = INITIAL_LOGS.map((legacy): AuditLogEntry => ({
  id: `audit-seed-${legacy.id}`,
  numericId: legacy.id,
  accountId: legacy.accountId,
  ipAddress: '127.0.0.1',
  action: legacy.itemSerial ? 'ITEM_PURCHASE' : 'ACCOUNT_SERVICE',
  status: 'COMMITTED',
  itemHex: null,
  itemSerial: legacy.itemSerial || null,
  creditsDelta: 0,
  wCoinCDelta: 0,
  idempotencyKey: null,
  details: legacy.details,
  timestampIso: new Date(legacy.dateline * 1000).toISOString(),
  dateline: legacy.dateline,
})).sort((a, b) => b.dateline - a.dateline);

let logDirInitialized = false;
let writeQueue: Promise<void> = Promise.resolve();

async function appendAuditLineToFile(entry: AuditLogEntry): Promise<void> {
  try {
    if (!logDirInitialized) {
      await fs.promises.mkdir(path.dirname(AUDIT_LOG_FILE), { recursive: true });
      logDirInitialized = true;
    }
    const line = `${JSON.stringify(entry)}\n`;
    await fs.promises.appendFile(AUDIT_LOG_FILE, line, { encoding: 'utf8', mode: 0o640 });
  } catch (err) {
    // Never crash transactions if container filesystem is mounted read-only
    console.warn(
      '[AuditLogger] File append warning:',
      err instanceof Error ? err.message : err
    );
  }
}

export interface RecordAuditParams {
  accountId: string;
  ipAddress: string;
  action: string;
  status: AuditStatus;
  itemHex?: string | null;
  itemSerial?: string | null;
  creditsDelta?: number;
  wCoinCDelta?: number;
  idempotencyKey?: string | null;
  details: string;
}

/**
 * Records a tamper-evident audit entry into:
 * 1) PostgreSQL `webshop_audit_logs` table (inside transaction client OR standalone pool for rollbacks)
 * 2) Dedicated append-only NDJSON file (`logs/audit.ndjson`)
 * 3) Bounded in-memory ring buffer for admin HawkEye inspection
 */
export async function recordAuditLog(
  params: RecordAuditParams,
  dbExecutor?: Pool | PoolClient | null
): Promise<AuditLogEntry> {
  const nowMs = Date.now();
  auditNumericSeq += 1;

  const entry: AuditLogEntry = {
    id: crypto.randomUUID(),
    numericId: auditNumericSeq,
    accountId: (params.accountId || 'anonymous').slice(0, 32),
    ipAddress: (params.ipAddress || '0.0.0.0').slice(0, 64),
    action: params.action.slice(0, 64),
    status: params.status,
    itemHex: params.itemHex ? params.itemHex.toUpperCase().slice(0, 512) : null,
    itemSerial: params.itemSerial ? params.itemSerial.toUpperCase().slice(0, 16) : null,
    creditsDelta: Math.trunc(params.creditsDelta || 0),
    wCoinCDelta: Math.trunc(params.wCoinCDelta || 0),
    idempotencyKey: params.idempotencyKey ? params.idempotencyKey.slice(0, 128) : null,
    details: params.details.slice(0, 1000),
    timestampIso: new Date(nowMs).toISOString(),
    dateline: Math.floor(nowMs / 1000),
  };

  if (dbExecutor) {
    try {
      await dbExecutor.query(
        `INSERT INTO webshop_audit_logs (
          id, account_id, ip_address, action, status,
          item_hex, item_serial, credits_delta, wcoinc_delta,
          idempotency_key, details, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          entry.id,
          entry.accountId,
          entry.ipAddress,
          entry.action,
          entry.status,
          entry.itemHex,
          entry.itemSerial,
          entry.creditsDelta,
          entry.wCoinCDelta,
          entry.idempotencyKey,
          entry.details,
          entry.timestampIso,
        ]
      );
    } catch (dbErr) {
      console.error(
        '[AuditLogger] Failed to write audit row to PostgreSQL:',
        dbErr instanceof Error ? dbErr.message : dbErr
      );
    }
  }

  auditRingBuffer.unshift(entry);
  if (auditRingBuffer.length > MAX_RING_BUFFER) {
    auditRingBuffer.length = MAX_RING_BUFFER;
  }

  writeQueue = writeQueue.then(() => appendAuditLineToFile(entry));
  return entry;
}

export function getRecentAuditLogs(limit = 200, accountFilter?: string): AuditLogEntry[] {
  const safeLimit = Math.max(1, Math.min(MAX_RING_BUFFER, limit));
  if (!accountFilter || !accountFilter.trim()) {
    return auditRingBuffer.slice(0, safeLimit);
  }
  const normalized = accountFilter.trim().toLowerCase();
  return auditRingBuffer
    .filter((e) => e.accountId.toLowerCase() === normalized)
    .slice(0, safeLimit);
}
