export interface OpenMuItemGrantRequest {
  loginName: string;
  packageSequence: number;
  priceSequence?: number | null;
  reference: string;
  reason: string;
}

export interface OpenMuItemGrant {
  id: string;
  packageSequence: number;
  priceSequence: number | null;
  itemCount: number;
  reference: string;
  createdAt: string;
}

export interface OpenMuCashShopProduct {
  productSequence: number;
  priceSequence: number;
  price: number;
  itemGroup: number | null;
  itemNumber: number | null;
  itemLevel: number;
  quantity: number;
  duration: string;
}

export interface OpenMuCashShopPackage {
  packageSequence: number;
  price: number;
  coinType: number | string;
  isBundle: boolean;
  products: OpenMuCashShopProduct[];
}

export class OpenMuInventoryApiError extends Error {
  constructor(
    public readonly code:
      | 'UNAVAILABLE'
      | 'INVALID_OFFER'
      | 'REFERENCE_CONFLICT'
      | 'ACCOUNT_NOT_FOUND'
      | 'REJECTED',
    public readonly retryable: boolean,
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'OpenMuInventoryApiError';
  }
}

function requireConfiguration(): { baseUrl: string; apiKey: string } {
  const baseUrl = process.env.OPENMU_API_URL?.trim().replace(/\/$/, '');
  const apiKey = process.env.OPENMU_API_KEY?.trim();
  if (!baseUrl || !apiKey) {
    throw new OpenMuInventoryApiError(
      'UNAVAILABLE',
      true,
      'The authoritative OpenMU Inventory API is not configured.'
    );
  }

  return { baseUrl, apiKey };
}

function requestSignal(signal?: AbortSignal): AbortSignal {
  return signal ?? AbortSignal.timeout(Number(process.env.OPENMU_API_TIMEOUT_MS) || 8_000);
}

async function fetchOpenMu(input: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (error) {
    throw new OpenMuInventoryApiError(
      'UNAVAILABLE',
      true,
      `The authoritative OpenMU Inventory API could not be reached: ${
        error instanceof Error ? error.message : 'network failure'
      }`
    );
  }
}

export async function getOpenMuCashShopCatalog(
  signal?: AbortSignal
): Promise<OpenMuCashShopPackage[]> {
  const { baseUrl, apiKey } = requireConfiguration();
  const response = await fetchOpenMu(`${baseUrl}/api/cash-shop/catalog`, {
    headers: { 'X-Api-Key': apiKey },
    signal: requestSignal(signal),
  });
  if (!response.ok) {
    throw new OpenMuInventoryApiError(
      response.status >= 500 ? 'UNAVAILABLE' : 'REJECTED',
      response.status >= 500,
      `The authoritative OpenMU catalog request was rejected (${response.status}).`,
      response.status
    );
  }

  return (await response.json()) as OpenMuCashShopPackage[];
}

export async function grantOpenMuInventoryItem(
  request: OpenMuItemGrantRequest,
  signal?: AbortSignal
): Promise<OpenMuItemGrant> {
  const { baseUrl, apiKey } = requireConfiguration();
  const response = await fetchOpenMu(
      `${baseUrl}/api/accounts/${encodeURIComponent(request.loginName)}/cash-shop/item-grants`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
        },
        body: JSON.stringify({
          packageSequence: request.packageSequence,
          priceSequence: request.priceSequence ?? null,
          reference: request.reference,
          reason: request.reason,
        }),
        signal: requestSignal(signal),
      }
    );

  if (response.ok) {
    return (await response.json()) as OpenMuItemGrant;
  }

  const status = response.status;
  if (status === 404) {
    throw new OpenMuInventoryApiError(
      'ACCOUNT_NOT_FOUND',
      false,
      'The OpenMU account does not exist.',
      status
    );
  }
  if (status === 409) {
    throw new OpenMuInventoryApiError(
      'REFERENCE_CONFLICT',
      false,
      'The order reference conflicts with an existing OpenMU grant.',
      status
    );
  }
  if (status === 422) {
    throw new OpenMuInventoryApiError(
      'INVALID_OFFER',
      false,
      'The mapped OpenMU cash shop offer is unavailable.',
      status
    );
  }

  throw new OpenMuInventoryApiError(
    status >= 500 ? 'UNAVAILABLE' : 'REJECTED',
    status >= 500,
    `The authoritative OpenMU Inventory API rejected the request (${status}).`,
    status
  );
}
