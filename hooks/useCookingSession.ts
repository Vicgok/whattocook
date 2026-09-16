import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { CookingSession } from "@/repositories/cooking.repository";
import {
  completeCookingSession,
  fetchActiveCookingSession,
  startCookingSession,
  updateCookingStep,
} from "@/services/cooking.service";
import {
  traceQueryExecution,
  traceSupabaseSkip,
} from "@/lib/supabase-request-tracer";
import { traceCache } from "@/lib/query-persistence";

export function useCookingSession(
  userId?: string,
  recipeId?: string,
  authReady = false,
) {
  const queryClient = useQueryClient();
  const key = queryKeys.cookingSession(userId ?? "guest", recipeId ?? "");
  const enabled = Boolean(authReady && userId && recipeId);
  useEffect(() => {
    if (!enabled)
      traceSupabaseSkip(
        "cookingSession",
        authReady ? "no_user_id" : "auth_not_ready",
      );
  }, [authReady, enabled]);
  const session = useQuery({
    queryKey: key,
    queryFn: () => {
      traceCache("cookingSession", "network", "miss");
      traceQueryExecution(key, "useCookingSession", true);
      return fetchActiveCookingSession(userId!, recipeId!);
    },
    enabled,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    meta: { persist: true },
    refetchOnReconnect: false,
  });
  return {
    ...session,
    start: useMutation({
      // Recipe detail already queries this key. Reuse that answer instead of
      // checking for an active session a second time before navigation.
      mutationFn: () =>
        session.data
          ? Promise.resolve(session.data)
          : startCookingSession(userId!, recipeId!, {
              knownNoActiveSession: session.isSuccess,
            }),
      retry: 0,
      onSuccess: (created) => queryClient.setQueryData(key, created),
    }),
    updateStep: useMutation({
      mutationFn: ({ sessionId, step }: { sessionId: string; step: number }) =>
        updateCookingStep(sessionId, step),
      retry: 0,
      onMutate: async ({ sessionId, step }) => {
        await queryClient.cancelQueries({ queryKey: key });
        const previous = queryClient.getQueryData<CookingSession | null>(key);
        queryClient.setQueryData<CookingSession | null>(key, (current) =>
          current && current.id === sessionId
            ? { ...current, currentStep: step }
            : current,
        );
        return { previous };
      },
      onError: (_error, _variables, context) =>
        queryClient.setQueryData(key, context?.previous),
      onSuccess: (_result, variables) =>
        queryClient.setQueryData<CookingSession | null>(key, (current) =>
          current && current.id === variables.sessionId
            ? { ...current, currentStep: variables.step }
            : current,
        ),
    }),
    complete: useMutation({
      mutationFn: (sessionId: string) => completeCookingSession(sessionId),
      retry: 0,
      onSuccess: () => queryClient.setQueryData(key, null),
    }),
  };
}
