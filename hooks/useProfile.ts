import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  completeOnboarding,
  fetchOrCreateProfile,
} from "@/repositories/profile.repository";

export function useProfile(
  userId?: string,
  authReady = false,
  loadProfile = true,
) {
  const queryClient = useQueryClient();
  const key = queryKeys.profile(userId ?? "guest");
  const query = useQuery({
    queryKey: key,
    queryFn: () => fetchOrCreateProfile(userId!),
    enabled: Boolean(authReady && userId && loadProfile),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    meta: { persist: true },
    refetchOnReconnect: false,
  });
  return {
    ...query,
    completeOnboarding: useMutation({
      mutationFn: () => completeOnboarding(userId!),
      retry: 0,
      onSuccess: (profile) => queryClient.setQueryData(key, profile),
    }),
  };
}
