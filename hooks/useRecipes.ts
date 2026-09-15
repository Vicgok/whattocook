import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getRecipe, listRecipes } from "@/services/recipe.service";

export function useRecipes() {
  return useQuery({ queryKey: queryKeys.recipes, queryFn: listRecipes, staleTime: 30 * 60 * 1000 });
}
export function useRecipe(id?: string) {
  const queryClient = useQueryClient();
  const listState = queryClient.getQueryState<Awaited<ReturnType<typeof listRecipes>>>(queryKeys.recipes);
  const list = queryClient.getQueryData<Awaited<ReturnType<typeof listRecipes>>>(queryKeys.recipes);
  return useQuery({
    queryKey: queryKeys.recipe(id ?? ""),
    queryFn: () => getRecipe(id!),
    enabled: Boolean(id),
    initialData: () => list?.find((recipe) => recipe.id === id),
    initialDataUpdatedAt: listState?.dataUpdatedAt,
    staleTime: 30 * 60 * 1000,
  });
}
