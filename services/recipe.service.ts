import { Recipe } from "@/types/recipe";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchRecipe, fetchRecipes } from "@/repositories/recipe.repository";

export async function listRecipes(): Promise<Recipe[]> {
  const recipes = await fetchRecipes();
  if (recipes) return recipes;
  throw new Error("Recipe catalogue is unavailable while Supabase is not configured.");
}
export async function getRecipe(id: string): Promise<Recipe | undefined> {
  const recipe = await fetchRecipe(id);
  if (recipe || isSupabaseConfigured) return recipe ?? undefined;
  throw new Error("Recipe catalogue is unavailable while Supabase is not configured.");
}
