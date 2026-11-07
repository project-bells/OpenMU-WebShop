import assert from 'node:assert/strict';
import test from 'node:test';
import {
  completeAuthoritativeItemOrder,
  completeAuthoritativeVipOrder,
  failAuthoritativeItemOrder,
  memoryAccounts,
  memoryAuthoritativeItemOrders,
  reserveAuthoritativeItemOrder,
  reserveAuthoritativeVipOrder,
  serverCatalog,
  TransactionDomainError,
} from '../src/server/dbRepository';

function addAccount(loginName: string, credits: number) {
  memoryAccounts.set(loginName.toLowerCase(), {
    id: crypto.randomUUID(),
    loginName,
    passwordPlainOrSimulatedBcrypt: '',
    passwordHash: '',
    securityCode: '0000000',
    email: `${loginName}@test.invalid`,
    state: 'Normal',
    role: 'USER',
    isMasterAdmin: false,
    registrationDate: new Date(0).toISOString(),
    credits,
    vaultMoney: 0,
    onlineMinutes: 0,
    exchangedOnlineHours: 0,
    wCoinC: 0,
    wCoinP: 0,
    goblinPoints: 0,
    vipUntil: null,
    vaultItems: [],
  });
}

test('authoritative order reserves credits once and refunds a definitive failure once', async () => {
  const item = serverCatalog[0];
  const originalPackage = item.openMuPackageSequence;
  const originalPrice = item.openMuPriceSequence;
  item.openMuPackageSequence = 10;
  item.openMuPriceSequence = 101;
  memoryAuthoritativeItemOrders.clear();
  addAccount('SagaUser', 100);
  const reference = 'webshop:order:12345678';

  try {
    const first = await reserveAuthoritativeItemOrder({
      accountLogin: 'SagaUser',
      itemUid: item.uid,
      reference,
    });
    const replay = await reserveAuthoritativeItemOrder({
      accountLogin: 'SagaUser',
      itemUid: item.uid,
      reference,
    });
    assert.equal(first.status, 'pending');
    assert.equal(replay.reference, first.reference);
    assert.equal(memoryAccounts.get('sagauser')?.credits, 100 - item.credits);

    await failAuthoritativeItemOrder(reference, 'INVALID_OFFER', true);
    await failAuthoritativeItemOrder(reference, 'INVALID_OFFER', true);
    assert.equal(memoryAccounts.get('sagauser')?.credits, 100);
    assert.equal(memoryAuthoritativeItemOrders.get(reference)?.status, 'rejected');
  } finally {
    item.openMuPackageSequence = originalPackage;
    item.openMuPriceSequence = originalPrice;
    memoryAccounts.delete('sagauser');
    memoryAuthoritativeItemOrders.clear();
  }
});

test('VIP order reserves once, persists expiry, and cannot be refunded after delivery', async () => {
  memoryAuthoritativeItemOrders.clear();
  addAccount('VipUser', 2_000);
  const reference = 'webshop:vip:12345678';
  try {
    const first = await reserveAuthoritativeVipOrder({ accountLogin: 'VipUser', months: 2, reference });
    const replay = await reserveAuthoritativeVipOrder({ accountLogin: 'VipUser', months: 2, reference });
    assert.equal(first.chargedCredits, 1_600);
    assert.equal(replay.reference, first.reference);
    assert.equal(memoryAccounts.get('vipuser')?.credits, 400);

    const vipUntil = new Date(Date.now() + 60 * 86_400_000).toISOString();
    await completeAuthoritativeVipOrder(reference, crypto.randomUUID(), vipUntil);
    await failAuthoritativeItemOrder(reference, 'REJECTED', true);
    assert.equal(memoryAccounts.get('vipuser')?.credits, 400);
    assert.equal(memoryAccounts.get('vipuser')?.vipUntil, vipUntil);
  } finally {
    memoryAccounts.delete('vipuser');
    memoryAuthoritativeItemOrders.clear();
  }
});

test('delivered order cannot be refunded and reference payload is immutable', async () => {
  const firstItem = serverCatalog[0];
  const secondItem = serverCatalog[1];
  const originals = [
    [firstItem.openMuPackageSequence, firstItem.openMuPriceSequence],
    [secondItem.openMuPackageSequence, secondItem.openMuPriceSequence],
  ] as const;
  firstItem.openMuPackageSequence = 10;
  firstItem.openMuPriceSequence = 101;
  secondItem.openMuPackageSequence = 11;
  secondItem.openMuPriceSequence = 111;
  memoryAuthoritativeItemOrders.clear();
  addAccount('SagaUser', 100);
  const reference = 'webshop:order:abcdefgh';

  try {
    await reserveAuthoritativeItemOrder({
      accountLogin: 'SagaUser',
      itemUid: firstItem.uid,
      reference,
    });
    await assert.rejects(
      reserveAuthoritativeItemOrder({
        accountLogin: 'SagaUser',
        itemUid: secondItem.uid,
        reference,
      }),
      (error: unknown) =>
        error instanceof TransactionDomainError && error.code === 'IDEMPOTENCY_CONFLICT'
    );
    await completeAuthoritativeItemOrder(reference, crypto.randomUUID());
    const afterDelivery = memoryAccounts.get('sagauser')!.credits;
    await failAuthoritativeItemOrder(reference, 'INVALID_OFFER', true);
    assert.equal(memoryAccounts.get('sagauser')?.credits, afterDelivery);
    assert.equal(memoryAuthoritativeItemOrders.get(reference)?.status, 'delivered');
  } finally {
    firstItem.openMuPackageSequence = originals[0][0];
    firstItem.openMuPriceSequence = originals[0][1];
    secondItem.openMuPackageSequence = originals[1][0];
    secondItem.openMuPriceSequence = originals[1][1];
    memoryAccounts.delete('sagauser');
    memoryAuthoritativeItemOrders.clear();
  }
});
