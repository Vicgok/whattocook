import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserPreferences } from "@/context/AppContext";
import { queryKeys } from "@/lib/query-keys";
import {
  traceQueryExecution,
  traceSupabaseSkip,
} from "@/lib/supabase-request-tracer";
import { traceCache } from "@/lib/query-persistence";
import {
  fetchPreferences,
  upsertPreferences,
} from "@/services/preferences.service";

export function useUserPreferences(userId?: string, authReady = false) {
  const queryClient = useQueryClient();
  const key = queryKeys.preferences(userId ?? "guest");
  const enabled = Boolean(authReady && userId);
  useEffect(() => {
    if (!enabled)
      traceSupabaseSkip(
        "preferences",
        authReady ? "no_user_id" : "auth_not_ready",
      );
  }, [authReady, enabled]);
  const preferences = useQuery({
    queryKey: key,
    queryFn: () => {
      traceCache("preferences", "network", "miss");
      traceQueryExecution(key, "useUserPreferences", true);
      return fetchPreferences(userId!);
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
      mutationFn: (next: UserPreferences) => upsertPreferences(userId!, next),
      retry: 0,
      onMutate: async (next) => {
        await queryClient.cancelQueries({ queryKey: key });
        const previous = queryClient.getQueryData<UserPreferences | null>(key);
        queryClient.setQueryData(key, next);
        return { previous };
      },
      onError: (_error, _next, context) =>
        queryClient.setQueryData(key, context?.previous),
      onSuccess: (next) => queryClient.setQueryData(key, next),
    }),
  };
}
