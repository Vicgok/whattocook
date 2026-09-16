import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getRecipe, listRecipes } from "@/services/recipe.service";
import { isSupabaseConfigured } from "@/lib/supabase";
import { traceQueryExecution } from "@/lib/supabase-request-tracer";
import { traceCache } from "@/lib/query-persistence";

export function useRecipes() {
  return useQuery({
    queryKey: queryKeys.recipes,
    queryFn: () => {
      traceCache("recipes", "network", "miss");
      traceQueryExecution(
        queryKeys.recipes,
        "useRecipes",
        isSupabaseConfigured,
      );
      return listRecipes();
    },
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    meta: { persist: true },
  });
}
export function useRecipe(id?: string) {
  const queryClient = useQueryClient();
  const listState = queryClient.getQueryState<
    Awaited<ReturnType<typeof listRecipes>>
  >(queryKeys.recipes);
  const list = queryClient.getQueryData<
    Awaited<ReturnType<typeof listRecipes>>
  >(queryKeys.recipes);
  return useQuery({
    queryKey: queryKeys.recipe(id ?? ""),
    queryFn: () => {
      traceQueryExecution(
        queryKeys.recipe(id ?? ""),
        "useRecipe",
        isSupabaseConfigured,
      );
      return getRecipe(id!);
    },
    enabled: Boolean(id),
    initialData: () => list?.find((recipe) => recipe.id === id),
    initialDataUpdatedAt: listState?.dataUpdatedAt,
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    meta: { persist: true },
  });
}
