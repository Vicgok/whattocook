import { createAnonymousSessionBootstrap } from "../lib/auth-bootstrap";
import { queryKeys } from "../lib/query-keys";

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
  expect(sessions.every((id) => id === "anonymous-user"), "concurrent bootstraps share the resolved user");
  expect(signInCalls === 1, "concurrent bootstraps sign in anonymously exactly once");

  expect(
    JSON.stringify(queryKeys.pantry("user-1")) === JSON.stringify(queryKeys.pantry("user-1")),
    "pantry keys are stable for one user",
  );
  expect(
    JSON.stringify(queryKeys.recipe("recipe-1")) !== JSON.stringify(queryKeys.recipes),
    "recipe detail and list keys have intentional separate namespaces",
  );
  expect(
    JSON.stringify(queryKeys.cookingSession("user-1", "recipe-1")) ===
      '["cooking-session","user-1","recipe-1"]',
    "active cooking-session key includes both ownership dimensions",
  );
})().catch((error) => {
  throw error;
});
