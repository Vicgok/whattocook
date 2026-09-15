import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { traceSupabaseRequest } from "@/lib/supabase-request-tracer";
import { createAnonymousSessionBootstrap } from "@/lib/auth-bootstrap";
import { traceSupabaseError, traceSupabaseSkip } from "@/lib/supabase-request-tracer";

type SupabaseSessionValue = { userId: string | null; isReady: boolean };
const SupabaseSessionContext = createContext<SupabaseSessionValue>({ userId: null, isReady: !isSupabaseConfigured });
/**
 * Shared across provider mounts (including React Strict Mode's development
 * remount). Restoring storage and anonymous sign-in are one bootstrap, so two
 * effects can never create two anonymous users.
 */
const bootstrapSession = createAnonymousSessionBootstrap(
  getSupabaseClient,
  () => traceSupabaseRequest("auth.signInAnonymously", "SupabaseSessionProvider.bootstrap"),
);

/** Establishes an invisible anonymous identity for guest pantry persistence. */
export function SupabaseSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SupabaseSessionValue>({ userId: null, isReady: !isSupabaseConfigured });
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      traceSupabaseSkip("auth", "supabase_not_configured");
      return;
    }
    let active = true;
    const pendingUpdates = new Set<ReturnType<typeof setTimeout>>();
    // Supabase can synchronously emit INITIAL_SESSION while the provider is
    // mounting. Schedule the update after React's current commit instead.
    const setUser = (userId: string | null) => {
      const timer = setTimeout(() => {
        pendingUpdates.delete(timer);
        if (active) setState({ userId, isReady: true });
      }, 0);
      pendingUpdates.add(timer);
    };
    // Requires Supabase Dashboard > Auth > Providers > Anonymous sign-ins.
    bootstrapSession().then((userId) => {
      if (__DEV__) console.info(`[AUTH STATE] authReady=true userId=${userId?.slice(0, 8) ?? "none"}`);
      setUser(userId);
    }).catch((error) => {
      traceSupabaseError("auth.bootstrap", error);
      setUser(null);
    });
    const { data: subscription } = client.auth.onAuthStateChange((_event, session) => {
      if (__DEV__) console.info(`[AUTH STATE] authReady=true userId=${session?.user.id.slice(0, 8) ?? "none"} isAnonymous=${session?.user.is_anonymous ?? false}`);
      setUser(session?.user.id ?? null);
    });
    return () => {
      active = false;
      pendingUpdates.forEach(clearTimeout);
      subscription.subscription.unsubscribe();
    };
  }, []);
  return <SupabaseSessionContext.Provider value={state}>{children}</SupabaseSessionContext.Provider>;
}
export const useSupabaseSession = () => useContext(SupabaseSessionContext);
