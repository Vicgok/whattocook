import { ReactNode, createContext, useContext, useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import {
  createAnonymousSessionEnsurer,
  createSessionBootstrap,
  type SessionBootstrapResult,
} from "@/lib/auth-bootstrap";
import { queryClient } from "@/lib/query-client";
import { clearUserOwnedCache } from "@/lib/query-persistence";
import { traceSupabaseError, traceSupabaseRequest, traceSupabaseSkip } from "@/lib/supabase-request-tracer";

type ValidationState = "verified" | "offline_unverified" | "error";
type AuthStatus = "booting" | "restoring_session" | "validating_identity" | "visitor" | "authenticated" | "offline_unverified" | "error";
type SupabaseSessionValue = { userId: string | null; isReady: boolean; session: Session | null; user: User | null; isAnonymous: boolean; isSignedIn: boolean; validation: ValidationState; authStatus: AuthStatus; bootstrapError: Error | null; ensureAnonymousSession: () => Promise<{ userId: string; session: Session }>; signOut: () => Promise<void>; retryBootstrap: () => Promise<void> };
type SessionState = Omit<SupabaseSessionValue, "ensureAnonymousSession" | "signOut" | "retryBootstrap">;
const emptyState = { userId: null, isReady: !isSupabaseConfigured, session: null, user: null, isAnonymous: false, isSignedIn: false, validation: "verified" as const, authStatus: isSupabaseConfigured ? "booting" as const : "visitor" as const, bootstrapError: null };
const SupabaseSessionContext = createContext<SupabaseSessionValue>({ ...emptyState, ensureAnonymousSession: async () => { throw new Error("Authentication provider is unavailable."); }, signOut: async () => undefined, retryBootstrap: async () => undefined });

const bootstrapSession = createSessionBootstrap(
  getSupabaseClient,
  (event, userId) => {
    if (event === "remote_validation_started") traceSupabaseRequest("auth.getUser", "SupabaseSessionProvider.bootstrap");
    if (event === "anonymous_recovery_started") traceSupabaseRequest("auth.signInAnonymously", "SupabaseSessionProvider.bootstrap");
    if (__DEV__) console.info(`[AUTH] ${event}${userId ? ` userId=${userId.slice(0, 8)}` : ""}`);
  },
  (userId) => clearUserOwnedCache(queryClient, userId),
);
const ensureAnonymous = createAnonymousSessionEnsurer(getSupabaseClient, (event, userId) => {
  if (event === "anonymous_recovery_started") traceSupabaseRequest("auth.signInAnonymously", "SupabaseSessionProvider.ensureAnonymousSession");
  if (__DEV__) console.info(`[AUTH] ${event}${userId ? ` userId=${userId.slice(0, 8)}` : ""}`);
});

/** Establishes a server-validated identity, while retaining local access on unknown/offline failures. */
export function SupabaseSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(emptyState);
  const bootstrapResolved = useRef(false);
  const applyBootstrapResult = (result: SessionBootstrapResult) => {
    const user = result.user as User | null;
    setState({
      userId: user?.id ?? null,
      session: result.session as Session | null,
      user,
      isReady: true,
      isAnonymous: user?.is_anonymous === true,
      isSignedIn: Boolean(user && !user.is_anonymous),
      validation: result.validation,
      authStatus: result.status,
      bootstrapError: null,
    });
  };
  const applyBootstrapFailure = (error: unknown) => {
    const bootstrapError = error instanceof Error ? error : new Error("Authentication startup failed.");
    bootstrapSession.reset();
    setState({ ...emptyState, isReady: true, validation: "error", authStatus: "error", bootstrapError });
  };
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) { traceSupabaseSkip("auth", "supabase_not_configured"); return; }
    let active = true;
    bootstrapResolved.current = false;
    const run = async () => {
      try {
        setState((current) => ({ ...current, isReady: false, authStatus: "restoring_session", bootstrapError: null }));
        if (__DEV__) console.info("[AUTH] Session restoration started");
        const result = await bootstrapSession();
        if (!active) return;
        bootstrapResolved.current = true;
        if (__DEV__) console.info(`[AUTH] Session restoration completed validation=${result.validation}`);
        applyBootstrapResult(result);
      } catch (error) {
        traceSupabaseError("auth.bootstrap", error);
        if (__DEV__) console.warn("[AUTH] Session restoration failed");
        if (active) { bootstrapResolved.current = true; applyBootstrapFailure(error); }
      }
    };
    void run();
    const { data: subscription } = client.auth.onAuthStateChange((_event, session) => {
      // INITIAL_SESSION and recovery events must not expose hydrated data before validation finishes.
      if (!active || !bootstrapResolved.current || !session?.user) return;
      const user = session.user;
      setState({ userId: user.id, session, user, isReady: true, isAnonymous: user.is_anonymous === true, isSignedIn: !user.is_anonymous, validation: "verified", authStatus: "authenticated", bootstrapError: null });
    });
    return () => { active = false; subscription.subscription.unsubscribe(); };
  }, []);
  const ensureAnonymousSession = async () => {
    const result = await ensureAnonymous();
    const user = result.user as User;
    const session = result.session as Session;
    bootstrapResolved.current = true;
    setState({
      userId: user.id,
      session,
      user,
      isReady: true,
      isAnonymous: user.is_anonymous === true,
      isSignedIn: !user.is_anonymous,
      validation: "verified",
      authStatus: "authenticated",
      bootstrapError: null,
    });
    return { userId: user.id, session };
  };
  const signOut = async () => {
    const client = getSupabaseClient();
    if (!client) return;
    bootstrapResolved.current = false;
    setState({ ...emptyState, isReady: false, authStatus: "restoring_session" });
    try {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) throw error;
      bootstrapSession.reset();
      const result = await bootstrapSession();
      bootstrapResolved.current = true;
      applyBootstrapResult(result);
    } catch (error) {
      bootstrapResolved.current = true;
      applyBootstrapFailure(error);
      throw error;
    }
  };
  const retryBootstrap = async () => {
    bootstrapResolved.current = false;
    setState({ ...emptyState, isReady: false, authStatus: "restoring_session" });
    bootstrapSession.reset();
    try {
      const result = await bootstrapSession();
      bootstrapResolved.current = true;
      applyBootstrapResult(result);
    } catch (error) {
      bootstrapResolved.current = true;
      applyBootstrapFailure(error);
    }
  };
  return <SupabaseSessionContext.Provider value={{ ...state, ensureAnonymousSession, signOut, retryBootstrap }}>{children}</SupabaseSessionContext.Provider>;
}
export const useSupabaseSession = () => useContext(SupabaseSessionContext);
