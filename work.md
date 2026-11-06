# Production readiness

## P0 — completed in code

- [x] Authenticate against real OpenMU BCrypt accounts.
- [x] Remove embedded/demo authentication fallback and default admin passwords.
- [x] Signed HttpOnly session, same-origin CSRF enforcement and server-side admin authorization.
- [x] Disable fake TrueMoney, fake PayPal capture, generic unsigned payment grants and non-authoritative item delivery.
- [x] PayPal Orders v2 create/capture flow with server-side amount, currency, package and account verification.
- [x] Idempotent OpenMU WCoin grant reference.
- [x] Online credit-to-WCoin exchange at 5 Credits = 1 WCoinC, with transactional reservation and retry key.
- [x] Conservative donation ladder: ฿50/100/150/300/500/1,000 and 0–15% bonus.
- [x] Fail-closed production configuration, security headers, reproducible lockfile and dependency audit.
- [x] Disable browser-reported online-time rewards; only authoritative OpenMU server rewards may grant currency.

## Activation gates — require operator/provider credentials

- [ ] Obtain a TrueMoney merchant/API contract and authenticated callback specification; then implement its adapter and tests.
- [ ] Create PayPal Business sandbox/live apps, configure credentials and webhook ID, and run the full event matrix.
- [ ] Obtain card-processing eligibility (PayPal Advanced Cards or a Thai PCI-compliant PSP); never collect raw card details in this app.
- [ ] Configure `OPENMU_DATABASE_URL`, a CashShop-role `OPENMU_API_KEY`, Redis, Turnstile, HTTPS domain and 64+ character session secret.
- [ ] Run an end-to-end sandbox payment and confirm exactly one webshop ledger credit and one OpenMU grant.
- [ ] Decide whether online-time rewards use OpenMU's built-in `GoblinPointsForPlayTimePlugIn`; do not trust browser-reported online time.

## Verification — 2026-11-06

- Implementation commit: `62556fd`.
- `npm run check`: TypeScript, 5 unit tests, client build and server bundle passed.
- `npm audit --audit-level=moderate`: 0 vulnerabilities.
- `git diff --check`: passed.
- Docker image build could not run because Docker Desktop daemon was not available on the verification machine.
- Live payment activation remains intentionally blocked until the provider credentials and end-to-end gates above are complete.
