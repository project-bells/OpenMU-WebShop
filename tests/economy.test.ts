import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDefaultPromotionConfig } from '../src/server/dbRepository';

test('default donation ladder is accessible and avoids double currency grants', () => {
  const config = buildDefaultPromotionConfig();
  assert.deepEqual(config.trueMoneyTiers.map((tier) => tier.amountThb), [50, 100, 150, 300, 500, 1000]);
  assert.equal(Math.max(...config.trueMoneyTiers.map((tier) => tier.bonusPercent)), 15);
  assert.ok(config.trueMoneyTiers.every((tier) => tier.wCoinC === 0));
  assert.equal(config.baseCreditsPerThb, 10);
});
