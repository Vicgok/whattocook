import { ReactNode, useEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useIsRestoring } from "@tanstack/react-query";
import { useSupabaseSession } from "@/context/SupabaseSessionContext";
import { useDeviceOnboardingCompletion } from "@/lib/onboarding-completion";
import { useProfile } from "@/hooks/useProfile";
import { colors, radius, spacing, typography } from "@/theme";

type BootstrapState = { status: "loading" } | { status: "error" } | { status: "ready"; destination: "onboarding" | "(tabs)" };

/** Owns the native splash: every startup path reaches ready or a retryable error. */
export function AppEntryGuard({ children }: { children: (destination: "onboarding" | "(tabs)") => ReactNode }) {
  const restoring = useIsRestoring();
  const { userId, isReady, validation, authStatus, retryBootstrap } = useSupabaseSession();
  const device = useDeviceOnboardingCompletion(userId ?? undefined);
  const profile = useProfile(userId ?? undefined, isReady && validation === "verified", validation === "verified");
  const lastProfileStatus = useRef<string | null>(null);

  const profileStatus = !userId ? "not_required" : profile.isPending ? "resolving" : profile.isError ? "error" : "resolved";
  useEffect(() => {
    if (__DEV__ && lastProfileStatus.current !== profileStatus) {
      lastProfileStatus.current = profileStatus;
      console.info(`[PROFILE] Resolution ${profileStatus}`);
    }
  }, [profileStatus]);

  useEffect(() => {
    if (profile.data?.onboardingCompleted && !device.completed)
      void device.markCompleted();
  }, [device.completed, device.markCompleted, profile.data?.onboardingCompleted]);

  let state: BootstrapState;
  if (restoring || !isReady || !device.ready) state = { status: "loading" };
  else if (validation === "error") state = { status: "error" };
  else if (validation === "offline_unverified") state = { status: "ready", destination: device.completed ? "(tabs)" : "onboarding" };
  else if (authStatus === "visitor") state = { status: "ready", destination: "onboarding" };
  else if (!userId) state = { status: "ready", destination: "onboarding" };
  else if (profile.isPending) state = { status: "loading" };
  else if (profile.isError) state = { status: "error" };
  // Marker synchronization is best-effort offline support, never a routing gate.
  else if (profile.data?.onboardingCompleted) state = { status: "ready", destination: "(tabs)" };
  else state = { status: "ready", destination: "onboarding" };

  const destination = state.status === "ready" ? state.destination : state.status;
  useEffect(() => {
    if (state.status === "loading") return;
    if (__DEV__) console.info(`[BOOT] navigationReady=true state=${destination} userId=${userId?.slice(0, 8) ?? "none"}`);
    if (state.status === "ready" && __DEV__) {
      console.info(`[ONBOARDING] current_user_status_resolved userId=${userId?.slice(0, 8) ?? "none"}`);
      console.info(`[ROUTING] destination=${state.destination}`);
    }
    if (__DEV__) console.info("[SPLASH] Hide requested");
    void SplashScreen.hideAsync().then(() => { if (__DEV__) console.info("[SPLASH] Hidden"); });
  }, [destination, state.status, userId]);

  if (state.status === "loading") return null;
  if (state.status === "error") return <StartupRetry onRetry={() => void (validation === "error" ? retryBootstrap() : profile.refetch())} />;
  return <>{children(state.destination)}</>;
}

function StartupRetry({ onRetry }: { onRetry: () => void }) {
  return <View style={{ flex: 1, justifyContent: "center", padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background }}>
    <Text style={{ ...typography.screenTitle, color: colors.text }}>We couldn’t start WhatToCook.</Text>
    <Text style={{ ...typography.body, color: colors.textSecondary }}>Check your connection and try again. Your local data has not been removed.</Text>
    <Pressable onPress={onRetry} accessibilityRole="button" style={{ minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: radius.button, backgroundColor: colors.primary }}><Text style={{ ...typography.button, color: colors.surface }}>Try again</Text></Pressable>
  </View>;
}
