import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  deletePantryIngredient,
  fetchPantryItems,
  upsertPantryIngredients,
} from "@/services/pantry.service";
import {
  traceQueryExecution,
  traceSupabaseSkip,
} from "@/lib/supabase-request-tracer";
import { traceCache } from "@/lib/query-persistence";
import { useSupabaseSession } from "@/context/SupabaseSessionContext";
import { canQueryCurrentIdentity } from "@/lib/identity-query-gate";

export function useRemotePantry(userId?: string, authReady = false) {
  const queryClient = useQueryClient();
  const session = useSupabaseSession();
  const key = queryKeys.pantry(userId ?? "guest");
  const enabled = canQueryCurrentIdentity(authReady, userId, session);
  useEffect(() => {
    if (!enabled)
      traceSupabaseSkip("pantry", authReady ? "no_user_id" : "auth_not_ready");
  }, [authReady, enabled]);
  const pantryQuery = useQuery({
    queryKey: key,
    queryFn: () => {
      traceCache("pantry", "network", "miss");
      traceQueryExecution(key, "useRemotePantry", true);
      return fetchPantryItems(userId!);
    },
    enabled,
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    meta: { persist: true },
    refetchOnReconnect: false,
  });
  return {
    ...pantryQuery,
    addIngredients: useMutation({
      mutationFn: (ingredientIds: string[]) =>
        upsertPantryIngredients(userId!, ingredientIds),
      retry: 0,
      onMutate: async (ingredientIds) => {
        await queryClient.cancelQueries({ queryKey: key });
        const previous =
          queryClient.getQueryData<
            Awaited<ReturnType<typeof fetchPantryItems>>
          >(key);
        const known = new Set(
          (previous ?? []).map((item) => item.ingredientId),
        );
        const now = new Date().toISOString();
        const optimistic = ingredientIds
          .filter((id) => !known.has(id))
          .map((ingredientId) => ({
            id: `optimistic-${ingredientId}`,
            userId: userId!,
            ingredientId,
            createdAt: now,
            updatedAt: now,
          }));
        queryClient.setQueryData(key, [...(previous ?? []), ...optimistic]);
        traceCache("pantry", "memory_cache", "fresh");
        return { previous };
      },
      onError: (_error, _ingredientIds, context) =>
        queryClient.setQueryData(key, context?.previous),
      onSuccess: (items) =>
        queryClient.setQueryData(key, (current: typeof items | undefined) => {
          const byIngredient = new Map(
            (current ?? []).map((item) => [item.ingredientId, item]),
          );
          items.forEach((item) => byIngredient.set(item.ingredientId, item));
          return [...byIngredient.values()].sort((a, b) =>
            a.createdAt.localeCompare(b.createdAt),
          );
        }),
    }),
    removeIngredient: useMutation({
      mutationFn: (ingredientId: string) =>
        deletePantryIngredient(userId!, ingredientId),
      retry: 0,
      onMutate: async (ingredientId) => {
        await queryClient.cancelQueries({ queryKey: key });
        const previous =
          queryClient.getQueryData<
            Awaited<ReturnType<typeof fetchPantryItems>>
          >(key);
        queryClient.setQueryData(key, (current: typeof previous) =>
          current?.filter((item) => item.ingredientId !== ingredientId),
        );
        traceCache("pantry", "memory_cache", "fresh");
        return { previous };
      },
      onError: (_error, _ingredientId, context) =>
        queryClient.setQueryData(key, context?.previous),
      onSuccess: (_result, ingredientId) =>
        queryClient.setQueryData(
          key,
          (current: Awaited<ReturnType<typeof fetchPantryItems>> | undefined) =>
            current?.filter((item) => item.ingredientId !== ingredientId),
        ),
    }),
  };
}
