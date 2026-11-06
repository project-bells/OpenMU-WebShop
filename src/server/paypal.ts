import crypto from 'crypto';

interface PayPalPackage {
  code: string;
  priceThb: number;
  credits: number;
}

function apiBase(): string {
  return process.env.PAYPAL_USE_SANDBOX === 'false' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

function credentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.PAYPAL_CLIENT_ID ?? '';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET ?? '';
  if (!clientId || !clientSecret) throw new Error('PayPal credentials are not configured.');
  return { clientId, clientSecret };
}

async function accessToken(): Promise<string> {
  const { clientId, clientSecret } = credentials();
  const response = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!response.ok) throw new Error(`PayPal authentication failed (${response.status}).`);
  const body = await response.json() as { access_token?: string };
  if (!body.access_token) throw new Error('PayPal did not return an access token.');
  return body.access_token;
}

async function paypalRequest(path: string, init: RequestInit): Promise<Response> {
  const token = await accessToken();
  return fetch(`${apiBase()}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers },
  });
}

export async function createPayPalOrder(pkg: PayPalPackage, loginName: string): Promise<{ orderId: string; approvalUrl: string }> {
  const origin = process.env.PUBLIC_ORIGIN!;
  const response = await paypalRequest('/v2/checkout/orders', {
    method: 'POST',
    headers: { 'PayPal-Request-Id': crypto.randomUUID() },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        custom_id: `${loginName}|${pkg.code}`,
        invoice_id: `openmu-${crypto.randomUUID()}`,
        description: `OpenMU credits ${pkg.code}`,
        amount: { currency_code: 'THB', value: pkg.priceThb.toFixed(2) },
      }],
      payment_source: { paypal: { experience_context: {
        user_action: 'PAY_NOW',
        return_url: `${origin}/api/payments/paypal/complete?packageCode=${encodeURIComponent(pkg.code)}`,
        cancel_url: `${origin}/?payment=cancelled`,
      } } },
    }),
  });
  const body = await response.json() as { id?: string; links?: Array<{ rel: string; href: string }> };
  const approvalUrl = body.links?.find((link) => link.rel === 'payer-action' || link.rel === 'approve')?.href;
  if (!response.ok || !body.id || !approvalUrl) throw new Error(`PayPal order creation failed (${response.status}).`);
  return { orderId: body.id, approvalUrl };
}

export interface CapturedPayPalOrder {
  captureId: string;
  loginName: string;
  packageCode: string;
  amount: string;
  currency: string;
}

export async function capturePayPalOrder(orderId: string): Promise<CapturedPayPalOrder> {
  if (!/^[A-Z0-9]{8,32}$/i.test(orderId)) throw new Error('Invalid PayPal order identifier.');
  const response = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: 'POST', headers: { 'PayPal-Request-Id': `capture-${orderId}` }, body: '{}',
  });
  const body = await response.json() as any;
  const unit = body.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  const [loginName, packageCode] = String(unit?.custom_id ?? '').split('|');
  if (!response.ok || body.status !== 'COMPLETED' || capture?.status !== 'COMPLETED' || !capture?.id || !loginName || !packageCode) {
    throw new Error(`PayPal capture was not completed (${response.status}).`);
  }
  return { captureId: capture.id, loginName, packageCode, amount: String(capture.amount?.value ?? ''), currency: String(capture.amount?.currency_code ?? '') };
}

export async function verifyPayPalWebhook(headers: Record<string, string | undefined>, event: unknown): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;
  const response = await paypalRequest('/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    body: JSON.stringify({
      transmission_id: headers['paypal-transmission-id'], transmission_time: headers['paypal-transmission-time'],
      cert_url: headers['paypal-cert-url'], auth_algo: headers['paypal-auth-algo'], transmission_sig: headers['paypal-transmission-sig'],
      webhook_id: webhookId, webhook_event: event,
    }),
  });
  if (!response.ok) return false;
  const body = await response.json() as { verification_status?: string };
  return body.verification_status === 'SUCCESS';
}
