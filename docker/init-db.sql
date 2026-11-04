-- =============================================================================
-- Egis-MU WEBSHOP Production PostgreSQL Schema (ACID Anti-Dupe, MEMB_STAT & Audit)
-- =============================================================================

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

CREATE INDEX IF NOT EXISTS idx_warehouse_account_login
  ON webshop_warehouse_items (LOWER(account_login));
CREATE INDEX IF NOT EXISTS idx_audit_logs_account_created
  ON webshop_audit_logs (LOWER(account_id), created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_serial
  ON webshop_audit_logs (item_serial) WHERE item_serial IS NOT NULL;
