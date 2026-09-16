type RequestSource =
  | "auth.signInAnonymously"
  | "ingredients.list"
  | "ingredientCategories.list"
  | "pantry.list"
  | "pantry.upsert"
  | "pantry.delete"
  | "recipes.list"
  | "recipes.detail"
  | "savedRecipes.list"
  | "savedRecipes.save"
  | "savedRecipes.delete"
  | "preferences.get"
  | "preferences.upsert"
  | "cookingSession.list"
  | "cookingSession.create"
  | "cookingSession.update"
  | "cookingSession.complete";

const requestDetails: Record<
  RequestSource,
  { endpoint: string; table: string; operation: string }
> = {
  "auth.signInAnonymously": {
    endpoint: "/auth/v1",
    table: "auth",
    operation: "POST signInAnonymously",
  },
  "ingredients.list": {
    endpoint: "/rest/v1/ingredients",
    table: "ingredients (+ ingredient_aliases)",
    operation: "GET select",
  },
  "ingredientCategories.list": {
    endpoint: "/rest/v1/ingredient_categories",
    table: "ingredient_categories",
    operation: "GET select",
  },
  "pantry.list": {
    endpoint: "/rest/v1/user_pantry_items",
    table: "user_pantry_items",
    operation: "GET select",
  },
  "pantry.upsert": {
    endpoint: "/rest/v1/user_pantry_items",
    table: "user_pantry_items",
    operation: "POST upsert",
  },
  "pantry.delete": {
    endpoint: "/rest/v1/user_pantry_items",
    table: "user_pantry_items",
    operation: "DELETE",
  },
  "recipes.list": {
    endpoint: "/rest/v1/recipes",
    table: "recipes (+ recipe_ingredients, recipe_steps)",
    operation: "GET select",
  },
  "recipes.detail": {
    endpoint: "/rest/v1/recipes",
    table: "recipes (+ recipe_ingredients, recipe_steps)",
    operation: "GET select by id",
  },
  "savedRecipes.list": {
    endpoint: "/rest/v1/saved_recipes",
    table: "saved_recipes",
    operation: "GET select",
  },
  "savedRecipes.save": {
    endpoint: "/rest/v1/saved_recipes",
    table: "saved_recipes",
    operation: "POST upsert",
  },
  "savedRecipes.delete": {
    endpoint: "/rest/v1/saved_recipes",
    table: "saved_recipes",
    operation: "DELETE",
  },
  "preferences.get": {
    endpoint: "/rest/v1/user_preferences",
    table: "user_preferences",
    operation: "GET select",
  },
  "preferences.upsert": {
    endpoint: "/rest/v1/user_preferences",
    table: "user_preferences",
    operation: "POST upsert",
  },
  "cookingSession.list": {
    endpoint: "/rest/v1/cooking_sessions",
    table: "cooking_sessions",
    operation: "GET select active",
  },
  "cookingSession.create": {
    endpoint: "/rest/v1/cooking_sessions",
    table: "cooking_sessions",
    operation: "POST insert",
  },
  "cookingSession.update": {
    endpoint: "/rest/v1/cooking_sessions",
    table: "cooking_sessions",
    operation: "PATCH current step",
  },
  "cookingSession.complete": {
    endpoint: "/rest/v1/cooking_sessions",
    table: "cooking_sessions",
    operation: "PATCH complete",
  },
};

const counts = new Map<RequestSource, number>();

/** Development-only network tracing. Counts repository/auth calls, never cache reads. */
export function traceSupabaseRequest(
  source: RequestSource,
  trigger: string,
  detail?: string,
) {
  if (!__DEV__) return;
  const count = (counts.get(source) ?? 0) + 1;
  counts.set(source, count);
  const request = requestDetails[source];
  console.info(
    `[SUPABASE NETWORK] #${count} source=${source} endpoint=${request.endpoint} table=${request.table} operation=${request.operation} trigger=${trigger} time=${new Date().toISOString()}${detail ? ` detail=${detail}` : ""}`,
  );
}

/** Logs only actual query-function executions; cache reads never call this. */
export function traceQueryExecution(
  queryKey: readonly unknown[],
  source: string,
  network: boolean,
) {
  if (!__DEV__) return;
  console.info(
    `[QUERY EXEC] key=${JSON.stringify(queryKey)} source=${source} network=${network} time=${new Date().toISOString()}`,
  );
}

export function traceSupabaseSkip(
  domain: string,
  reason: "auth_not_ready" | "no_user_id" | "supabase_not_configured",
) {
  if (!__DEV__) return;
  console.info(
    `[SUPABASE SKIP] domain=${domain} reason=${reason} time=${new Date().toISOString()}`,
  );
}

export function traceSupabaseError(source: string, error: unknown) {
  if (!__DEV__) return;
  const record = error && typeof error === "object" ? error as Record<string, unknown> : null;
  const message = error instanceof Error
    ? error.message
    : typeof record?.message === "string"
      ? record.message
      : String(error);
  const detail = typeof record?.details === "string" ? ` details=${record.details}` : "";
  const hint = typeof record?.hint === "string" ? ` hint=${record.hint}` : "";
  const code = typeof record?.code === "string" ? ` code=${record.code}` : "";
  console.error(`[SUPABASE ERROR] source=${source} message=${message}${code}${detail}${hint}`);
}

export function getSupabaseRequestCounts(): Readonly<Record<string, number>> {
  return Object.fromEntries(counts);
}
