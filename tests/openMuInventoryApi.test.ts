import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getOpenMuCashShopCatalog,
  grantOpenMuInventoryItem,
  OpenMuInventoryApiError,
} from '../src/server/openMuInventoryApi';

function restoreEnvironment(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

test('inventory grant sends only authoritative offer identifiers and immutable reference', async () => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.OPENMU_API_URL;
  const originalKey = process.env.OPENMU_API_KEY;
  process.env.OPENMU_API_URL = 'https://openmu.internal/';
  process.env.OPENMU_API_KEY = 'secret-key';
  globalThis.fetch = (async (input, init) => {
    assert.equal(
      String(input),
      'https://openmu.internal/api/accounts/Hero01/cash-shop/item-grants'
    );
    assert.equal(new Headers(init?.headers).get('X-Api-Key'), 'secret-key');
    assert.deepEqual(JSON.parse(String(init?.body)), {
      packageSequence: 10,
      priceSequence: 101,
      reference: 'webshop:order:01JTEST',
      reason: 'Credits purchase',
    });
    return new Response(
      JSON.stringify({
        id: 'grant-1',
        packageSequence: 10,
        priceSequence: 101,
        itemCount: 1,
        reference: 'webshop:order:01JTEST',
        createdAt: new Date(0).toISOString(),
      }),
      { status: 201 }
    );
  }) as typeof fetch;

  try {
    const result = await grantOpenMuInventoryItem({
      loginName: 'Hero01',
      packageSequence: 10,
      priceSequence: 101,
      reference: 'webshop:order:01JTEST',
      reason: 'Credits purchase',
    });
    assert.equal(result.id, 'grant-1');
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnvironment('OPENMU_API_URL', originalUrl);
    restoreEnvironment('OPENMU_API_KEY', originalKey);
  }
});

test('catalog discovery uses the CashShop API key', async () => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.OPENMU_API_URL;
  const originalKey = process.env.OPENMU_API_KEY;
  process.env.OPENMU_API_URL = 'https://openmu.internal/';
  process.env.OPENMU_API_KEY = 'secret-key';
  globalThis.fetch = (async (input, init) => {
    assert.equal(String(input), 'https://openmu.internal/api/cash-shop/catalog');
    assert.equal(new Headers(init?.headers).get('X-Api-Key'), 'secret-key');
    return new Response(JSON.stringify([{
      packageSequence: 10,
      price: 100,
      coinType: 0,
      isBundle: false,
      products: [{
        productSequence: 1,
        priceSequence: 101,
        price: 100,
        itemGroup: 0,
        itemNumber: 1,
        itemLevel: 0,
        quantity: 1,
        duration: '00:00:00',
      }],
    }]), { status: 200 });
  }) as typeof fetch;

  try {
    const catalog = await getOpenMuCashShopCatalog();
    assert.equal(catalog[0]?.products[0]?.priceSequence, 101);
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnvironment('OPENMU_API_URL', originalUrl);
    restoreEnvironment('OPENMU_API_KEY', originalKey);
  }
});

test('network ambiguity is retryable and reference conflict is not', async () => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.OPENMU_API_URL;
  const originalKey = process.env.OPENMU_API_KEY;
  process.env.OPENMU_API_URL = 'https://openmu.internal';
  process.env.OPENMU_API_KEY = 'secret-key';

  try {
    globalThis.fetch = (async () => {
      throw new Error('timeout');
    }) as typeof fetch;
    await assert.rejects(
      grantOpenMuInventoryItem({
        loginName: 'Hero01',
        packageSequence: 10,
        reference: 'webshop:order:1',
        reason: 'test',
      }),
      (error: unknown) =>
        error instanceof OpenMuInventoryApiError &&
        error.code === 'UNAVAILABLE' &&
        error.retryable
    );

    globalThis.fetch = (async () => new Response(null, { status: 409 })) as typeof fetch;
    await assert.rejects(
      grantOpenMuInventoryItem({
        loginName: 'Hero01',
        packageSequence: 10,
        reference: 'webshop:order:1',
        reason: 'test',
      }),
      (error: unknown) =>
        error instanceof OpenMuInventoryApiError &&
        error.code === 'REFERENCE_CONFLICT' &&
        !error.retryable
    );
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnvironment('OPENMU_API_URL', originalUrl);
    restoreEnvironment('OPENMU_API_KEY', originalKey);
  }
});
