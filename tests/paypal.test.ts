import assert from 'node:assert/strict';
import test from 'node:test';
import { createPayPalOrder } from '../src/server/paypal';

test('PayPal order amount and account binding are server-controlled in THB', async () => {
  process.env.PAYPAL_CLIENT_ID = 'client';
  process.env.PAYPAL_CLIENT_SECRET = 'secret';
  process.env.PAYPAL_USE_SANDBOX = 'true';
  process.env.PUBLIC_ORIGIN = 'https://shop.example.com';
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = (async (input, init) => {
    const url = String(input);
    calls.push({ url, init });
    if (url.endsWith('/v1/oauth2/token')) return new Response(JSON.stringify({ access_token: 'token' }), { status: 200 });
    return new Response(JSON.stringify({ id: 'ORDER123', links: [{ rel: 'payer-action', href: 'https://paypal.example/approve' }] }), { status: 201 });
  }) as typeof fetch;
  try {
    const order = await createPayPalOrder({ code: 'PKG_100', priceThb: 100, credits: 1030 }, 'Hero01');
    assert.equal(order.orderId, 'ORDER123');
    const payload = JSON.parse(String(calls[1].init?.body));
    assert.deepEqual(payload.purchase_units[0].amount, { currency_code: 'THB', value: '100.00' });
    assert.equal(payload.purchase_units[0].custom_id, 'Hero01|PKG_100');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
