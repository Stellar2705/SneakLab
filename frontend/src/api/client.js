const TOKEN_KEY = 'sneaklab-token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) =>
  t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

/**
 * Tiny fetch wrapper — Vite proxies /api → http://localhost:5000 in dev.
 * api('/api/products') → { products: [...] } etc. Throws Error(body.message).
 */
export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Request failed (${res.status})`);
  }

  if (!res.ok) {
    if (res.status === 401) setToken(null);
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
}
