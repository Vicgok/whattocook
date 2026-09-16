type BootstrapUser = { id: string };
type BootstrapSession = { user: BootstrapUser };
export type SessionBootstrapResult = {
  session: BootstrapSession | null;
  user: BootstrapUser | null;
  validation: "verified" | "offline_unverified";
  status: "visitor" | "authenticated" | "offline_unverified";
  recoveredFromUserId?: string;
};
type BootstrapClient = { auth: {
  getSession: () => Promise<{ data: { session: BootstrapSession | null }; error?: unknown }>;
  getUser: () => Promise<{ data: { user: BootstrapUser | null }; error: unknown | null }>;
  signOut: (options?: { scope?: "local" | "global" | "others" }) => Promise<{ error: unknown | null }>;
  signInAnonymously: () => Promise<{ data: { user: BootstrapUser | null; session?: BootstrapSession | null }; error: Error | null }>;
} };
type LifecycleEvent = "local_session_restored" | "remote_validation_started" | "remote_validation_succeeded" | "remote_identity_invalid" | "validation_network_error" | "invalid_identity_cleanup_started" | "invalid_identity_cleanup_completed" | "anonymous_recovery_started" | "anonymous_recovery_completed";
export type SessionBootstrap = (() => Promise<SessionBootstrapResult>) & { reset: () => void };
export type AnonymousSessionEnsurer = (() => Promise<{ session: BootstrapSession; user: BootstrapUser }>) & { reset: () => void };

const definitiveInvalidCodes = new Set(["bad_jwt", "user_not_found", "session_not_found", "session_expired", "refresh_token_not_found", "refresh_token_already_used"]);
const AUTH_OPERATION_DEADLINE_MS = 12_000;

class AuthBootstrapTimeoutError extends Error {
  constructor(operation: string) { super(`Auth ${operation} exceeded its startup deadline.`); this.name = "AuthBootstrapTimeoutError"; }
}

/** A deadline is only a hung-request escape hatch; successful calls do not wait. */
function settleAuthOperation<T>(operation: string, promise: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new AuthBootstrapTimeoutError(operation)), AUTH_OPERATION_DEADLINE_MS);
    promise.then((value) => { clearTimeout(timeout); resolve(value); }, (error) => { clearTimeout(timeout); reject(error); });
  });
}

/** Only documented Auth API codes make a remotely missing session definitive. */
export function classifyRemoteIdentity(error: unknown): "invalid" | "unknown" {
  // Supabase Auth's documented response fields are status and code. Checking
  // those avoids depending on error-message text or SDK-private internals.
  const authError = error && typeof error === "object" ? error as { status?: unknown; code?: unknown; name?: unknown } : null;
  if (authError?.status === 400 && authError.name === "AuthSessionMissingError") return "invalid";
  if (typeof authError?.status === "number" && typeof authError.code === "string")
    return authError.status === 401 && definitiveInvalidCodes.has(authError.code) ? "invalid" : "unknown";
  return "unknown";
}

/** `getSession` is local restoration only; `getUser` is the one server validation. */
export function createSessionBootstrap(getClient: () => BootstrapClient | null, onLifecycle: (event: LifecycleEvent, userId?: string) => void, clearInvalidUserCache: (userId: string) => Promise<void>): SessionBootstrap {
  let bootstrap: Promise<SessionBootstrapResult> | null = null;
  const run = async (): Promise<SessionBootstrapResult> => {
    const client = getClient();
    if (!client) return { session: null, user: null, validation: "verified", status: "visitor" };
    const local = await settleAuthOperation("session restoration", client.auth.getSession());
    const session = local.data.session;
    // A missing local session is a resolved visitor state. Account creation is
    // deliberately deferred until a user-owned write explicitly asks for it.
    if (!session?.user) return { session: null, user: null, validation: "verified", status: "visitor" };
    const oldUserId = session.user.id;
    onLifecycle("local_session_restored", oldUserId);
    onLifecycle("remote_validation_started", oldUserId);
    let remote;
    try { remote = await settleAuthOperation("remote validation", client.auth.getUser()); } catch {
      onLifecycle("validation_network_error", oldUserId);
      return { session, user: session.user, validation: "offline_unverified", status: "offline_unverified" };
    }
    if (remote.data.user && !remote.error) {
      onLifecycle("remote_validation_succeeded", oldUserId);
      return { session, user: remote.data.user, validation: "verified", status: "authenticated" };
    }
    if (classifyRemoteIdentity(remote.error) !== "invalid") {
      onLifecycle("validation_network_error", oldUserId);
      return { session, user: session.user, validation: "offline_unverified", status: "offline_unverified" };
    }
    onLifecycle("remote_identity_invalid", oldUserId);
    onLifecycle("invalid_identity_cleanup_started", oldUserId);
    await clearInvalidUserCache(oldUserId);
    const signOut = await settleAuthOperation("invalid-session cleanup", client.auth.signOut({ scope: "local" }));
    if (signOut.error) throw signOut.error;
    onLifecycle("invalid_identity_cleanup_completed", oldUserId);
    // Deleted identities return to the public introduction. A replacement
    // account is only made by ensureAnonymousSession at a persistence boundary.
    return { session: null, user: null, validation: "verified", status: "visitor", recoveredFromUserId: oldUserId };
  };
  const callable = (() => { if (!bootstrap) bootstrap = run(); return bootstrap; }) as SessionBootstrap;
  callable.reset = () => { bootstrap = null; };
  return callable;
}

/** Creates an anonymous session only for an explicit user-owned write. */
export function createAnonymousSessionEnsurer(
  getClient: () => { auth: Pick<BootstrapClient["auth"], "getSession" | "signInAnonymously"> } | null,
  onLifecycle: (event: LifecycleEvent, userId?: string) => void,
): AnonymousSessionEnsurer {
  let inFlight: Promise<{ session: BootstrapSession; user: BootstrapUser }> | null = null;
  const callable = (() => {
    if (!inFlight) {
      inFlight = (async () => {
        const client = getClient();
        if (!client) throw new Error("Supabase is not configured.");
        const local = await settleAuthOperation("session restoration", client.auth.getSession());
        if (local.data.session?.user)
          return { session: local.data.session, user: local.data.session.user };
        onLifecycle("anonymous_recovery_started");
        const result = await settleAuthOperation("anonymous sign-in", client.auth.signInAnonymously());
        if (result.error) throw result.error;
        const user = result.data.user;
        if (!user) throw new Error("Anonymous sign-in returned no user.");
        onLifecycle("anonymous_recovery_completed", user.id);
        return { session: result.data.session ?? { user }, user };
      })().finally(() => {
        inFlight = null;
      });
    }
    return inFlight;
  }) as AnonymousSessionEnsurer;
  callable.reset = () => {
    inFlight = null;
  };
  return callable;
}

/** Backward-compatible narrow helper retained for existing callers/tests. */
export function createAnonymousSessionBootstrap(getClient: () => { auth: Pick<BootstrapClient["auth"], "getSession" | "signInAnonymously"> } | null, onAnonymousSignIn: () => void) {
  const ensure = createAnonymousSessionEnsurer(getClient, (event) => {
    if (event === "anonymous_recovery_started") onAnonymousSignIn();
  });
  return async () => (await ensure()).user.id;
}
