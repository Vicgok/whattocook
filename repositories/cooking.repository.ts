import { getSupabaseClient } from "@/lib/supabase";
import { traceSupabaseRequest } from "@/lib/supabase-request-tracer";

export type CookingSession = {
  id: string;
  userId: string;
  recipeId: string;
  currentStep: number;
  status: "in_progress" | "completed" | "abandoned";
};

type CookingSessionRow = {
  id: string; user_id: string; recipe_id: string; current_step: number;
  status: CookingSession["status"];
};
const toSession = (row: CookingSessionRow): CookingSession => ({
  id: row.id, userId: row.user_id, recipeId: row.recipe_id,
  currentStep: row.current_step, status: row.status,
});

export async function fetchActiveCookingSession(userId: string, recipeId: string): Promise<CookingSession | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  traceSupabaseRequest("cookingSession.list");
  const { data, error } = await client.from("cooking_sessions").select("*")
    .eq("user_id", userId).eq("recipe_id", recipeId).eq("status", "in_progress")
    .order("updated_at", { ascending: false }).limit(1);
  if (error) throw error;
  const row = (data as unknown as CookingSessionRow[])[0];
  return row ? toSession(row) : null;
}

export async function startCookingSession(userId: string, recipeId: string): Promise<CookingSession> {
  const existing = await fetchActiveCookingSession(userId, recipeId);
  if (existing) return existing;
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");
  traceSupabaseRequest("cookingSession.create");
  const { data, error } = await client.from("cooking_sessions")
    .insert({ user_id: userId, recipe_id: recipeId, current_step: 0, status: "in_progress" })
    .select().single();
  if (error) throw error;
  return toSession(data as unknown as CookingSessionRow);
}

export async function updateCookingStep(sessionId: string, currentStep: number): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  traceSupabaseRequest("cookingSession.update");
  const { error } = await client.from("cooking_sessions")
    .update({ current_step: currentStep, updated_at: new Date().toISOString() }).eq("id", sessionId);
  if (error) throw error;
}

export async function completeCookingSession(sessionId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  traceSupabaseRequest("cookingSession.complete");
  const { error } = await client.from("cooking_sessions")
    .update({ status: "completed", completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", sessionId);
  if (error) throw error;
}
