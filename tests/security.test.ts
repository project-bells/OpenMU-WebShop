import assert from 'node:assert/strict';
import test from 'node:test';
import { createSession, readSession, validateProductionConfiguration } from '../src/server/security';

const originalEnv = { ...process.env };

test.afterEach(() => {
  process.env = { ...originalEnv };
});

test('production configuration fails closed without required secrets', () => {
  process.env = { NODE_ENV: 'production' };
  assert.throws(() => validateProductionConfiguration(), /Missing required settings/);
});

test('production configuration requires HTTPS', () => {
  process.env = {
    NODE_ENV: 'production', OPENMU_DATABASE_URL: 'postgres://db', OPENMU_API_URL: 'https://admin.example',
    OPENMU_API_KEY: 'x'.repeat(32), PUBLIC_ORIGIN: 'http://shop.example', SESSION_SECRET: 's'.repeat(64),
  };
  assert.throws(() => validateProductionConfiguration(), /HTTPS/);
});

test('session cookie is signed, secure and rejects tampering', () => {
  process.env.SESSION_SECRET = 's'.repeat(64);
  const session = createSession('Hero01', false);
  assert.match(session.cookie, /HttpOnly; Secure; SameSite=Lax/);
  const cookiePair = session.cookie.split(';')[0];
  const request = { headers: { cookie: cookiePair } } as any;
  assert.equal(readSession(request)?.loginName, 'Hero01');
  request.headers.cookie = `${cookiePair}x`;
  assert.equal(readSession(request), null);
});
