/**
 * In-memory client cache for dashboard data (routes, payments, bookings).
 * Preserves fetched records across client-side page transitions in Next.js,
 * eliminating redundant API calls and loading screens on navigation.
 */

export function createMemoryCache() {
  const cache = new Map();

  return {
    get(key = "default") {
      return cache.get(key) || null;
    },

    set(key = "default", data) {
      cache.set(key, data);
    },

    has(key = "default") {
      return cache.has(key);
    },

    delete(key) {
      cache.delete(key);
    },

    clear() {
      cache.clear();
    },
  };
}

export const routesCache = createMemoryCache();
export const paymentsCache = createMemoryCache();
export const bookingsCache = createMemoryCache();
