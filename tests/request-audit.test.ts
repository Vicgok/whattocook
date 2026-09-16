import { createAnonymousSessionBootstrap, createSessionBootstrap } from "../lib/auth-bootstrap";
import { queryKeys } from "../lib/query-keys";
import { canQueryCurrentIdentity } from "../lib/identity-query-gate";


const expect = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

let signInCalls = 0;
const bootstrap = createAnonymousSessionBootstrap(
  () => ({
    auth: {
      getSession: async () => ({ data: { session: null } }),
      signInAnonymously: async () => {
        signInCalls += 1;
        return { data: { user: { id: "anonymous-user" } }, error: null };
      },
    },
  }),
  () => undefined,
);
void (async () => {
  const sessions = await Promise.all([bootstrap(), bootstrap(), bootstrap()]);
  expect(
    sessions.every((id) => id === "anonymous-user"),
    "concurrent bootstraps share the resolved user",
  );
  expect(
    signInCalls === 1,
    "concurrent bootstraps sign in anonymously exactly once",
  );

  let retryableSignInCalls = 0;
  const retryableEnsure = createAnonymousSessionBootstrap(
    () => ({
      auth: {
        getSession: async () => ({ data: { session: null } }),
        signInAnonymously: async () => {
          retryableSignInCalls += 1;
          return retryableSignInCalls === 1
            ? { data: { user: null }, error: new Error("offline") }
            : { data: { user: { id: "retry-user" } }, error: null };
        },
      },
    }),
    () => undefined,
  );
  await retryableEnsure().then(
    () => { throw new Error("a failed anonymous sign-in should reject"); },
    () => undefined,
  );
  expect(await retryableEnsure() === "retry-user", "a failed anonymous sign-in may be retried");
  expect(retryableSignInCalls === 2, "a retry reuses no failed in-flight creation promise");

  expect(
    JSON.stringify(queryKeys.pantry("user-1")) ===
      JSON.stringify(queryKeys.pantry("user-1")),
    "pantry keys are stable for one user",
  );
  expect(
    JSON.stringify(queryKeys.recipe("recipe-1")) !==
      JSON.stringify(queryKeys.recipes),
    "recipe detail and list keys have intentional separate namespaces",
  );
  expect(
    JSON.stringify(queryKeys.cookingSession("user-1", "recipe-1")) ===
      '["cooking-session","user-1","recipe-1"]',
    "active cooking-session key includes both ownership dimensions",
  );
  expect(
    JSON.stringify(queryKeys.profile("user-1")) === '["profile","user-1"]',
    "profile key is user-scoped",
  );
  expect(
    JSON.stringify(queryKeys.savedRecipes("user-a")) !==
      JSON.stringify(queryKeys.savedRecipes("user-b")),
    "saved recipes never share a cache key",
  );

  let validAnonymousCalls = 0;
  const valid = createSessionBootstrap(
    () => ({ auth: {
      getSession: async () => ({ data: { session: { user: { id: "valid-user" } } } }),
      getUser: async () => ({ data: { user: { id: "valid-user" } }, error: null }),
      signOut: async () => ({ error: null }),
      signInAnonymously: async () => { validAnonymousCalls += 1; return { data: { user: { id: "unexpected" } }, error: null }; },
    } }),
    () => undefined,
    async () => undefined,
  );
  const validResult = await valid();
  expect(validResult.user?.id === "valid-user" && validResult.validation === "verified", "a valid remote identity keeps its session");
  expect(validAnonymousCalls === 0, "a valid remote identity never creates an anonymous replacement");

  let freshAnonymousCalls = 0;
  const fresh = createSessionBootstrap(
    () => ({ auth: {
      getSession: async () => ({ data: { session: null } }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
      signInAnonymously: async () => { freshAnonymousCalls += 1; return { data: { user: { id: "fresh-install" } }, error: null }; },
    } }),
    () => undefined,
    async () => undefined,
  );
  const freshResult = await fresh();
  expect(freshResult.user === null && freshResult.status === "visitor", "fresh startup resolves a public visitor");
  expect(freshAnonymousCalls === 0, "fresh startup does not create an anonymous identity");

  let deletedAnonymousCalls = 0;
  let deletedCleanupCalls = 0;
  const deleted = createSessionBootstrap(
    () => ({ auth: {
      getSession: async () => ({ data: { session: { user: { id: "deleted-user" } } } }),
      getUser: async () => ({ data: { user: null }, error: { status: 401, code: "user_not_found" } }),
      signOut: async () => ({ error: null }),
      signInAnonymously: async () => { deletedAnonymousCalls += 1; return { data: { user: { id: "fresh-anonymous" } }, error: null }; },
    } }),
    () => undefined,
    async (userId) => { expect(userId === "deleted-user", "recovery clears the deleted user only"); deletedCleanupCalls += 1; },
  );
  const deletedResults = await Promise.all([deleted(), deleted()]);
  expect(deletedResults.every((result) => result.user === null && result.status === "visitor"), "deleted identities return to visitor onboarding");
  expect(deletedAnonymousCalls === 0 && deletedCleanupCalls === 1, "deleted-user cleanup never creates a replacement account automatically");

  let offlineAnonymousCalls = 0;
  let offlineCleanupCalls = 0;
  const offline = createSessionBootstrap(
    () => ({ auth: {
      getSession: async () => ({ data: { session: { user: { id: "offline-user" } } } }),
      getUser: async () => ({ data: { user: null }, error: { status: 503, code: "unexpected_failure" } }),
      signOut: async () => ({ error: null }),
      signInAnonymously: async () => { offlineAnonymousCalls += 1; return { data: { user: { id: "unexpected" } }, error: null }; },
    } }),
    () => undefined,
    async () => { offlineCleanupCalls += 1; },
  );
  const offlineResult = await offline();
  expect(offlineResult.user?.id === "offline-user" && offlineResult.validation === "offline_unverified", "network failures preserve the local identity");
  expect(offlineAnonymousCalls === 0 && offlineCleanupCalls === 0, "offline recovery never clears cache or creates a user");

  expect(canQueryCurrentIdentity(true, "valid-user", { isReady: true, validation: "verified", userId: "valid-user" }), "verified returning users may query their own preferences");
  expect(!canQueryCurrentIdentity(true, "deleted-user", { isReady: false, validation: "verified", userId: "deleted-user" }), "no user-owned query starts while identity validation is unresolved");
  expect(!canQueryCurrentIdentity(true, "deleted-user", { isReady: true, validation: "verified", userId: "fresh-anonymous" }), "old identity responses cannot be requested through the new identity");
  expect(canQueryCurrentIdentity(true, "fresh-anonymous", { isReady: true, validation: "verified", userId: "fresh-anonymous" }), "verified new anonymous users may initialize onboarding preferences");
  expect(!canQueryCurrentIdentity(true, "offline-user", { isReady: true, validation: "offline_unverified", userId: "offline-user" }), "offline startup reads cache without dispatching a new preferences request");
})().catch((error) => {
  throw error;
});
