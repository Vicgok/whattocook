import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  traceQueryExecution,
  traceSupabaseSkip,
} from "@/lib/supabase-request-tracer";
import { traceCache } from "@/lib/query-persistence";
import {
  fetchSavedRecipeIds,
  saveRecipe,
  unsaveRecipe,
} from "@/services/saved-recipes.service";

export function useSavedRecipeIds(userId?: string, authReady = false) {
  const queryClient = useQueryClient();
  const key = queryKeys.savedRecipes(userId ?? "guest");
  const enabled = Boolean(authReady && userId);
  useEffect(() => {
    if (!enabled)
      traceSupabaseSkip(
        "savedRecipes",
        authReady ? "no_user_id" : "auth_not_ready",
      );
  }, [authReady, enabled]);
  const saved = useQuery({
    queryKey: key,
    queryFn: () => {
      traceCache("savedRecipes", "network", "miss");
      traceQueryExecution(key, "useSavedRecipeIds", true);
      return fetchSavedRecipeIds(userId!);
    },
    enabled,
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    meta: { persist: true },
    refetchOnReconnect: false,
  });
  return {
    ...saved,
    save: useMutation({
      mutationFn: (recipeId: string) => saveRecipe(userId!, recipeId),
      retry: 0,
      onMutate: async (recipeId) => {
        await queryClient.cancelQueries({ queryKey: key });
        const previous = queryClient.getQueryData<string[]>(key);
        queryClient.setQueryData<string[]>(key, (current = []) =>
          current.includes(recipeId) ? current : [recipeId, ...current],
        );
        return { previous };
      },
      onError: (_error, _recipeId, context) =>
        queryClient.setQueryData(key, context?.previous),
      onSuccess: (recipeId) =>
        queryClient.setQueryData<string[]>(key, (current = []) =>
          current.includes(recipeId) ? current : [recipeId, ...current],
        ),
    }),
    unsave: useMutation({
      mutationFn: (recipeId: string) => unsaveRecipe(userId!, recipeId),
      retry: 0,
      onMutate: async (recipeId) => {
        await queryClient.cancelQueries({ queryKey: key });
        const previous = queryClient.getQueryData<string[]>(key);
        queryClient.setQueryData<string[]>(key, (current = []) =>
          current.filter((id) => id !== recipeId),
        );
        return { previous };
      },
      onError: (_error, _recipeId, context) =>
        queryClient.setQueryData(key, context?.previous),
      onSuccess: (recipeId) =>
        queryClient.setQueryData<string[]>(key, (current = []) =>
          current.filter((id) => id !== recipeId),
        ),
    }),
  };
}
