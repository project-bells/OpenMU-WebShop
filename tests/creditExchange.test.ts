import assert from 'node:assert/strict';
import test from 'node:test';
import {
  quoteCreditExchange,
  selectCreditExchangeAttempt,
} from '../src/utils/creditExchange';

test('credit exchange uses the fixed one-way 5:1 rate and safe limits', () => {
  assert.deepEqual(quoteCreditExchange(100), { credits: 100, wCoinC: 20 });
  assert.deepEqual(quoteCreditExchange(50_000), { credits: 50_000, wCoinC: 10_000 });
  assert.equal(quoteCreditExchange(95), null);
  assert.equal(quoteCreditExchange(101), null);
  assert.equal(quoteCreditExchange(50_005), null);
});

test('pending exchange retries reuse the exact idempotency key', () => {
  const pending = { credits: 500, idempotencyKey: 'credit-exchange-key-1' };
  assert.equal(selectCreditExchangeAttempt(500, pending, () => 'new-key'), pending);
  assert.deepEqual(selectCreditExchangeAttempt(1_000, pending, () => 'new-key'), {
    credits: 1_000,
    idempotencyKey: 'new-key',
  });
});
