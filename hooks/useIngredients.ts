import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { listIngredientCategories, listIngredients } from "@/services/ingredient.service";

export function useIngredients(search = "") {
  return useQuery({ queryKey: queryKeys.ingredients(search), queryFn: () => listIngredients(search), staleTime: 6 * 60 * 60 * 1000, refetchOnReconnect: false });
}
export function useIngredientCategories() {
  return useQuery({ queryKey: queryKeys.categories, queryFn: listIngredientCategories, staleTime: 24 * 60 * 60 * 1000, refetchOnReconnect: false });
}
