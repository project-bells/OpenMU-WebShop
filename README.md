# OpenMU WebShop

Player webshop and donation gateway for OpenMU-Origins. Authentication uses OpenMU's BCrypt account records; WCoin changes go through the idempotent OpenMU CashShop API.

## Current provider status

- PayPal: Orders v2 sandbox/live adapter, server-side capture and verified webhook endpoint.
- TrueMoney: prepared configuration but intentionally disabled until an official merchant/provider API contract is supplied.
- Cards: disabled until PayPal Advanced Cards or another PCI-compliant hosted-fields provider approves the merchant account.
- Webshop Credits: exchangeable at 5 Credits = 1 WCoinC using a transactional reservation and idempotent OpenMU grant.

No endpoint accepts a voucher string, browser callback, screenshot, user-supplied price or unverified webhook as proof of payment.

## Setup

1. Copy `.env.example` to `.env` and replace every placeholder.
2. Create an OpenMU API key with the CashShop role.
3. Set `ADMIN_ACCOUNTS` to a comma-separated allowlist of real OpenMU login names.
4. Keep `PAYMENTS_ENABLED=false` while testing.
5. Run `npm ci` and `npm run check`.
6. Start with `docker compose up -d --build` behind an HTTPS reverse proxy.
7. Complete every activation gate in [work.md](work.md) and follow [SECURITY.md](SECURITY.md).

For PayPal, register `https://YOUR-DOMAIN/api/webhooks/paypal`, save its webhook ID, and subscribe to capture completed, denied, pending, refunded and reversed events. Enable live mode only after sandbox reconciliation proves that one provider capture creates exactly one webshop ledger entry and one OpenMU grant.
