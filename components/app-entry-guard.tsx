import { ReactNode, useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useIsRestoring } from "@tanstack/react-query";
import { useSupabaseSession } from "@/context/SupabaseSessionContext";
import { useDeviceOnboardingCompletion } from "@/lib/onboarding-completion";

type BootstrapState =
  | { status: "loading" }
  | { status: "ready"; destination: "onboarding" | "(tabs)" }
  | { status: "error"; destination: "onboarding" };

/** Resolves exactly one initial route before the root navigator is mounted. */
export function AppEntryGuard({ children }: { children: (destination: "onboarding" | "(tabs)") => ReactNode }) {
  const restoring = useIsRestoring(); const { userId, isReady } = useSupabaseSession();
  const device = useDeviceOnboardingCompletion(userId ?? undefined);
  // The device marker is the startup source of truth. Profile loading belongs
  // to post-onboarding data hydration, never the first-route decision.
  let state: BootstrapState = restoring || !isReady || !device.ready ? { status: "loading" } : device.error ? { status: "error", destination: "onboarding" } : { status: "ready", destination: device.completed ? "(tabs)" : "onboarding" };
  useEffect(() => {
    if (state.status === "loading") return;
    if (state.status === "error" && __DEV__) console.warn("[BOOTSTRAP] Profile resolution failed; safely starting onboarding.");
    void SplashScreen.hideAsync();
  }, [state.status]);
  if (state.status === "loading") return null;
  return <>{children(state.destination)}</>;
}
