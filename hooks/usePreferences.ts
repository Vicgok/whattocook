import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserPreferences } from "@/context/AppContext";
import { queryKeys } from "@/lib/query-keys";
import {
  traceQueryExecution,
  traceQueryGate,
  traceSupabaseSkip,
} from "@/lib/supabase-request-tracer";
import { useSupabaseSession } from "@/context/SupabaseSessionContext";
import { canQueryCurrentIdentity } from "@/lib/identity-query-gate";
import { traceCache } from "@/lib/query-persistence";
import {
  fetchPreferences,
  upsertPreferences,
} from "@/services/preferences.service";
import {
  mergePreferenceMutation,
  rollbackPreferenceMutation,
} from "@/domain/preferences/preference-mutation";

const emptyPreferences: UserPreferences = {
  dietPreferences: [], baseDiet: null, glutenFree: false, dairyFree: false,
  nutritionGoals: [], allergies: [], avoidedIngredients: [], units: "Metric",
  notificationsEnabled: true, appearance: "System default",
};

export function useUserPreferences(userId?: string, authReady = false) {
  const queryClient = useQueryClient();
  const session = useSupabaseSession();
  const key = queryKeys.preferences(userId ?? "guest");
  const enabled = canQueryCurrentIdentity(authReady, userId, session);
  useEffect(() => {
    if (!enabled) {
      traceQueryGate(
        "preferences",
        false,
        userId,
        !session.isReady
          ? "identity_validating"
          : session.validation !== "verified"
            ? "identity_offline_unverified"
            : userId !== session.userId
              ? "identity_mismatch"
              : authReady
                ? "no_user_id"
                : "caller_not_ready",
      );
      traceSupabaseSkip(
        "preferences",
        authReady ? "no_user_id" : "auth_not_ready",
      );
    } else traceQueryGate("preferences", true, userId);
  }, [authReady, enabled, session.isReady, session.userId, session.validation, userId]);
  const preferences = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => {
      traceCache("preferences", "network", "miss");
      traceQueryExecution(key, "useUserPreferences", true);
      return fetchPreferences(userId!, signal);
    },
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    meta: { persist: true },
    refetchOnReconnect: false,
  });
  return {
    ...preferences,
    update: useMutation({
      mutationFn: (changes: Partial<UserPreferences>) => {
        const current = queryClient.getQueryData<UserPreferences | null>(key);
        return upsertPreferences(
          userId!,
          mergePreferenceMutation(current ?? emptyPreferences, changes),
        );
      },
      scope: { id: `preferences:${userId ?? "guest"}` },
      retry: 0,
      onMutate: async (changes: Partial<UserPreferences>) => {
        await queryClient.cancelQueries({ queryKey: key });
        const previous = queryClient.getQueryData<UserPreferences | null>(key);
        const next = mergePreferenceMutation(previous ?? emptyPreferences, changes);
        queryClient.setQueryData(key, next);
        return { previous };
      },
      onError: (_error, _next, context) =>
        queryClient.setQueryData(key, rollbackPreferenceMutation(context?.previous)),
      onSuccess: (next) =>
        queryClient.setQueryData<UserPreferences | null>(key, (current) =>
          // Keep any later optimistic screen edit while a scoped mutation is
          // queued, then let that queued save persist the merged object.
          mergePreferenceMutation(next, current ?? {}),
        ),
    }),
  };
}
