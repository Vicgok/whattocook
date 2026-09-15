import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Query, QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { CANONICAL_DATA_VERSION } from "@/lib/cache-version";
export { CANONICAL_DATA_VERSION } from "@/lib/cache-version";

export const QUERY_CACHE_KEY = "WHATTOCOOK_QUERY_CACHE_V1";
export const QUERY_CACHE_SCHEMA_VERSION = 1;

/** Only successful, explicitly opted-in application data is written to disk. */
export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: QUERY_CACHE_KEY,
  throttleTime: 1_000,
});

export const shouldPersistQuery = (query: Query) =>
  query.meta?.persist === true && query.state.status === "success";

export function traceCache(domain: string, source: "persisted_cache" | "memory_cache" | "network", status: "fresh" | "stale" | "miss") {
  if (!__DEV__) return;
  console.info(`[DATA] domain=${domain} source=${source} status=${status} network=${source === "network"}`);
}

/** Versioned keys make old canonical payloads unusable; remove them after hydration. */
export function removeLegacyCanonicalQueries(queryClient: QueryClient) {
  const canonicalRoots = new Set(["ingredients", "ingredient-categories", "recipes", "recipe"]);
  queryClient.removeQueries({
    predicate: (query) => {
      const [root, version] = query.queryKey;
      return typeof root === "string" && canonicalRoots.has(root) && version !== CANONICAL_DATA_VERSION;
    },
  });
}

export function traceHydratedQueries(queryClient: QueryClient) {
  if (!__DEV__) return;
  queryClient.getQueryCache().getAll().forEach((query) => {
    if (query.meta?.persist === true && query.state.status === "success") {
      console.info(`[DATA] domain=${String(query.queryKey[0])} source=persisted_cache status=fresh network=false`);
    }
  });
}
