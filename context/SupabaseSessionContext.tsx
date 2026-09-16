import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { traceSupabaseRequest } from "@/lib/supabase-request-tracer";
import { createAnonymousSessionBootstrap } from "@/lib/auth-bootstrap";
import {
  traceSupabaseError,
  traceSupabaseSkip,
} from "@/lib/supabase-request-tracer";

type SupabaseSessionValue = {
  userId: string | null;
  isReady: boolean;
  session: Session | null;
  user: User | null;
  isAnonymous: boolean;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
};
const emptyState = {
  userId: null,
  isReady: !isSupabaseConfigured,
  session: null,
  user: null,
  isAnonymous: false,
  isSignedIn: false,
};
const SupabaseSessionContext = createContext<SupabaseSessionValue>({
  ...emptyState,
  signOut: async () => undefined,
});
/**
 * Shared across provider mounts (including React Strict Mode's development
 * remount). Restoring storage and anonymous sign-in are one bootstrap, so two
 * effects can never create two anonymous users.
 */
const bootstrapSession = createAnonymousSessionBootstrap(
  getSupabaseClient,
  () =>
    traceSupabaseRequest(
      "auth.signInAnonymously",
      "SupabaseSessionProvider.bootstrap",
    ),
);

/** Establishes an invisible anonymous identity for guest pantry persistence. */
export function SupabaseSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] =
    useState<Omit<SupabaseSessionValue, "signOut">>(emptyState);
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
    const setUser = (session: Session | null) => {
      const timer = setTimeout(() => {
        pendingUpdates.delete(timer);
        const user = session?.user ?? null;
        if (active)
          setState({
            userId: user?.id ?? null,
            session,
            user,
            isReady: true,
            isAnonymous: user?.is_anonymous === true,
            isSignedIn: Boolean(user && !user.is_anonymous),
          });
      }, 0);
      pendingUpdates.add(timer);
    };
    // Requires Supabase Dashboard > Auth > Providers > Anonymous sign-ins.
    bootstrapSession()
      .then(async (userId) => {
        if (__DEV__)
          console.info(
            `[AUTH STATE] authReady=true userId=${userId?.slice(0, 8) ?? "none"}`,
          );
        const { data } = await client.auth.getSession();
        setUser(data.session);
      })
      .catch((error) => {
        traceSupabaseError("auth.bootstrap", error);
        setUser(null);
      });
    const { data: subscription } = client.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          // The product remains usable after logout, but under a brand-new guest identity.
          client.auth
            .signInAnonymously()
            .catch((error) =>
              traceSupabaseError("auth.signInAnonymously.afterSignOut", error),
            );
          return;
        }
        if (__DEV__)
          console.info(
            `[AUTH STATE] authReady=true userId=${session?.user.id.slice(0, 8) ?? "none"} isAnonymous=${session?.user.is_anonymous ?? false}`,
          );
        setUser(session);
      },
    );
    return () => {
      active = false;
      pendingUpdates.forEach(clearTimeout);
      subscription.subscription.unsubscribe();
    };
  }, []);
  const signOut = async () => {
    const client = getSupabaseClient();
    if (client) await client.auth.signOut();
  };
  return (
    <SupabaseSessionContext.Provider value={{ ...state, signOut }}>
      {children}
    </SupabaseSessionContext.Provider>
  );
}
export const useSupabaseSession = () => useContext(SupabaseSessionContext);
