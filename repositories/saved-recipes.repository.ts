import { getSupabaseClient } from "@/lib/supabase";
import {
  traceSupabaseError,
  traceSupabaseRequest,
} from "@/lib/supabase-request-tracer";

export async function fetchSavedRecipeIds(userId: string): Promise<string[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  traceSupabaseRequest("savedRecipes.list", "useSavedRecipeIds");
  const { data, error } = await client
    .from("saved_recipes")
    .select("recipe_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    traceSupabaseError("savedRecipes.list", error);
    throw error;
  }
  return (data ?? []).map((row) => row.recipe_id);
}

export async function saveRecipe(
  userId: string,
  recipeId: string,
): Promise<string> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");
  traceSupabaseRequest("savedRecipes.save", "useSavedRecipeIds.save");
  const { error } = await client
    .from("saved_recipes")
    .upsert(
      { user_id: userId, recipe_id: recipeId },
      { onConflict: "user_id,recipe_id" },
    );
  if (error) {
    traceSupabaseError("savedRecipes.save", error);
    throw error;
  }
  return recipeId;
}

export async function unsaveRecipe(
  userId: string,
  recipeId: string,
): Promise<string> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");
  traceSupabaseRequest("savedRecipes.delete", "useSavedRecipeIds.unsave");
  const { error } = await client
    .from("saved_recipes")
    .delete()
    .eq("user_id", userId)
    .eq("recipe_id", recipeId);
  if (error) {
    traceSupabaseError("savedRecipes.delete", error);
    throw error;
  }
  return recipeId;
}
