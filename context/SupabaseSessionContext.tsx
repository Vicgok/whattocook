import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { traceSupabaseRequest } from "@/lib/supabase-request-tracer";

type SupabaseSessionValue = { userId: string | null; isReady: boolean };
const SupabaseSessionContext = createContext<SupabaseSessionValue>({ userId: null, isReady: !isSupabaseConfigured });
let anonymousSignIn: Promise<string | null> | null = null;

function ensureAnonymousSession() {
  if (!anonymousSignIn) {
    const client = getSupabaseClient();
    if (!client) return Promise.resolve(null);
    traceSupabaseRequest("auth.signInAnonymously");
    anonymousSignIn = client.auth.signInAnonymously()
      .then(({ data }) => data.user?.id ?? null)
      .finally(() => { anonymousSignIn = null; });
  }
  return anonymousSignIn;
}

/** Establishes an invisible anonymous identity for guest pantry persistence. */
export function SupabaseSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SupabaseSessionValue>({ userId: null, isReady: !isSupabaseConfigured });
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;
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
    client.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) return setUser(data.session.user.id);
      // Requires Supabase Dashboard > Auth > Providers > Anonymous sign-ins.
      setUser(await ensureAnonymousSession());
    }).catch(() => setUser(null));
    const { data: subscription } = client.auth.onAuthStateChange((_event, session) => setUser(session?.user.id ?? null));
    return () => {
      active = false;
      pendingUpdates.forEach(clearTimeout);
      subscription.subscription.unsubscribe();
    };
  }, []);
  return <SupabaseSessionContext.Provider value={state}>{children}</SupabaseSessionContext.Provider>;
}
export const useSupabaseSession = () => useContext(SupabaseSessionContext);
