# Security model

This application handles paid virtual currency. Production starts only when the OpenMU database, OpenMU API, public HTTPS origin and a 64-character session secret are configured.

## Trust boundaries

- OpenMU's `data."Account"` table is authoritative for login and BCrypt password verification.
- The browser never receives the OpenMU API key or payment-provider secrets.
- WCoin is granted only through OpenMU's idempotent cash-shop grant API. The webshop must not update OpenMU coin columns directly.
- Webshop credits are held in the webshop ledger. A credit-to-WCoin exchange reserves credits first and reuses the same reference when retried.
- Admin access comes only from an authenticated account listed in `ADMIN_ACCOUNTS`; request headers cannot confer a role.

## Payment activation gates

Keep `PAYMENTS_ENABLED=false` until all applicable sandbox checks pass. PayPal uses Orders v2 and server-side capture. TrueMoney and cards remain fail-closed until contracts, credentials and the provider's authenticated callback/API are configured. A voucher string, redirect, browser response, screenshot or user-submitted amount is never proof of payment.

Before going live:

1. Use TLS and a reverse proxy that overwrites forwarded headers.
2. Set unique database, Redis, session and provider secrets through a secret manager.
3. Register and verify the exact PayPal webhook URL and `PAYPAL_WEBHOOK_ID`.
4. Test completed, pending, denied, duplicate, replayed, refunded and chargeback events.
5. Reconcile provider captures, webshop ledger entries and OpenMU grants daily.
6. Back up the OpenMU database and payment ledger, and test restoration.
7. Restrict database permissions: read OpenMU account authentication fields and write only webshop-owned tables.
8. Never log passwords, payment credentials, full card data, TrueMoney PINs or session cookies.

Report vulnerabilities privately to the server operator. Rotate affected credentials before publishing details.
