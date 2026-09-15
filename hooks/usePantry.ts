import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { deletePantryIngredient, fetchPantryItems, upsertPantryIngredients } from "@/services/pantry.service";

export function useRemotePantry(userId?: string) {
  const queryClient = useQueryClient();
  const pantryQuery = useQuery({ queryKey: queryKeys.pantry(userId ?? "guest"), queryFn: () => fetchPantryItems(userId!), enabled: Boolean(userId), staleTime: 30 * 1000, refetchOnMount: true });
  const invalidate = () => userId && queryClient.invalidateQueries({ queryKey: queryKeys.pantry(userId) });
  return {
    ...pantryQuery,
    addIngredients: useMutation({ mutationFn: (ingredientIds: string[]) => upsertPantryIngredients(userId!, ingredientIds), onSuccess: invalidate }),
    removeIngredient: useMutation({ mutationFn: (ingredientId: string) => deletePantryIngredient(userId!, ingredientId), onSuccess: invalidate }),
  };
}
