import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

// query → Promise<products[]>
const cachePromise = {};
export const clearProductCache = () => {
  for (const k of Object.keys(cachePromise)) delete cachePromise[k];
};

/**
 * Shared product fetcher — one network request per query for the session,
 * but every caller subscribes to the shared promise so nobody stays empty.
 */
export function useProducts(query = '') {
  const [state, setState] = useState({ products: [], loading: true });

  useEffect(() => {
    let alive = true;

    if (!cachePromise[query]) {
      cachePromise[query] = api(`/api/products${query}`)
        .then((d) => d.products)
        .catch(() => []);
    }

    cachePromise[query].then((products) => {
      if (alive) setState({ products, loading: false });
    });

    return () => {
      alive = false;
    };
  }, [query]);

  return state;
}

/** Resolve cart item ids against the catalog. */
export function resolveCartItems(ids, catalog) {
  const map = new Map(catalog.map((p) => [p._id || p.id, p]));
  return ids.map((i) => ({ ...i, product: map.get(i.id) })).filter((i) => i.product);
}
