const CSRF_KEY = 'openmu_webshop_csrf';

export function setCsrfToken(token: string | undefined): void {
  if (token) sessionStorage.setItem(CSRF_KEY, token);
  else sessionStorage.removeItem(CSRF_KEY);
}

export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const method = (init.method ?? 'GET').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrf = sessionStorage.getItem(CSRF_KEY);
    if (csrf) headers.set('X-CSRF-Token', csrf);
  }
  return fetch(input, { ...init, credentials: 'same-origin', headers });
}
