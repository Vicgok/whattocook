type RequestSource = "auth.signInAnonymously" | "ingredients.list" | "ingredientCategories.list" | "pantry.list" | "pantry.upsert" | "pantry.delete" | "recipes.list" | "cookingSession.list" | "cookingSession.create" | "cookingSession.update" | "cookingSession.complete";

const counts = new Map<RequestSource, number>();

/** Development-only network tracing. Counts repository/auth calls, never cache reads. */
export function traceSupabaseRequest(source: RequestSource, detail?: string) {
  if (!__DEV__) return;
  const count = (counts.get(source) ?? 0) + 1;
  counts.set(source, count);
  console.info(`[SUPABASE REQUEST #${count}] ${source}${detail ? ` ${detail}` : ""}`);
}

export function getSupabaseRequestCounts(): Readonly<Record<string, number>> {
  return Object.fromEntries(counts);
}
