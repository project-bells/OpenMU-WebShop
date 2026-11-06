export const CREDIT_EXCHANGE_RATE = 5;
export const MIN_CREDIT_EXCHANGE = 100;
export const MAX_CREDIT_EXCHANGE = 50_000;

export interface CreditExchangeAttempt {
  credits: number;
  idempotencyKey: string;
}

export function quoteCreditExchange(value: unknown): { credits: number; wCoinC: number } | null {
  const credits = Math.trunc(Number(value));
  if (!Number.isFinite(credits) || credits < MIN_CREDIT_EXCHANGE || credits > MAX_CREDIT_EXCHANGE || credits % CREDIT_EXCHANGE_RATE !== 0) {
    return null;
  }
  return { credits, wCoinC: credits / CREDIT_EXCHANGE_RATE };
}

export function selectCreditExchangeAttempt(
  credits: number,
  pending: CreditExchangeAttempt | null,
  createKey: () => string
): CreditExchangeAttempt {
  return pending?.credits === credits ? pending : { credits, idempotencyKey: createKey() };
}
