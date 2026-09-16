import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  listIngredientCategories,
  listIngredients,
} from "@/services/ingredient.service";
import { isSupabaseConfigured } from "@/lib/supabase";
import { traceQueryExecution } from "@/lib/supabase-request-tracer";
import { traceCache } from "@/lib/query-persistence";

export function useIngredients(search = "") {
  const key = queryKeys.ingredients(search);
  return useQuery({
    queryKey: key,
    queryFn: () => {
      traceCache("ingredients", "network", "miss");
      traceQueryExecution(key, "useIngredients", isSupabaseConfigured);
      return listIngredients(search);
    },
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    meta: { persist: search.trim().length === 0 },
    refetchOnReconnect: false,
  });
}
export function useIngredientCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => {
      traceCache("ingredientCategories", "network", "miss");
      traceQueryExecution(
        queryKeys.categories,
        "useIngredientCategories",
        isSupabaseConfigured,
      );
      return listIngredientCategories();
    },
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    meta: { persist: true },
    refetchOnReconnect: false,
  });
}
