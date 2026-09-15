import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { CookingSession } from "@/repositories/cooking.repository";
import { completeCookingSession, fetchActiveCookingSession, startCookingSession, updateCookingStep } from "@/services/cooking.service";

export function useCookingSession(userId?: string, recipeId?: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.cookingSession(userId ?? "guest", recipeId ?? "");
  const session = useQuery({ queryKey: key, queryFn: () => fetchActiveCookingSession(userId!, recipeId!), enabled: Boolean(userId && recipeId), staleTime: 15 * 1000, refetchOnMount: true });
  return {
    ...session,
    start: useMutation({
      // Recipe detail already queries this key. Reuse that answer instead of
      // checking for an active session a second time before navigation.
      mutationFn: () => session.data ? Promise.resolve(session.data) : startCookingSession(userId!, recipeId!),
      onSuccess: (created) => queryClient.setQueryData(key, created),
    }),
    updateStep: useMutation({
      mutationFn: ({ sessionId, step }: { sessionId: string; step: number }) => updateCookingStep(sessionId, step),
      onSuccess: (_result, variables) => queryClient.setQueryData<CookingSession | null>(key, (current) => current && current.id === variables.sessionId ? { ...current, currentStep: variables.step } : current),
    }),
    complete: useMutation({
      mutationFn: (sessionId: string) => completeCookingSession(sessionId),
      onSuccess: () => queryClient.setQueryData(key, null),
    }),
  };
}
