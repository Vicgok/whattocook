import type { QueryClient } from "@tanstack/react-query";

const USER_SCOPED_ROOTS = new Set([
  "pantry",
  "user-preferences",
  "saved-recipes",
  "cooking-session",
  "profile",
]);
/** Removes only private data; catalogue queries intentionally survive account changes. */
export function clearUserScopedCache(queryClient: QueryClient) {
  queryClient.removeQueries({
    predicate: (query) => USER_SCOPED_ROOTS.has(String(query.queryKey[0])),
  });
}
