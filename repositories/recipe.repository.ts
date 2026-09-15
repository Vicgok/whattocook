import { Recipe, RecipeStep } from "@/types/recipe";
import { RecipeIngredient } from "@/domain/ingredients/ingredient.types";
import { getSupabaseClient } from "@/lib/supabase";
import { traceSupabaseError, traceSupabaseRequest } from "@/lib/supabase-request-tracer";

type RecipeRow = { id: string; title: string; total_time_minutes: number; difficulty: Recipe["difficulty"]; calories: number | null; protein_grams: number | null; recipe_ingredients: { id: string; ingredient_id: string; quantity: number | null; unit: RecipeIngredient["unit"]; preparation: string | null; is_optional: boolean; sort_order: number }[]; recipe_steps: { id: string; step_number: number; instruction: string; duration_seconds: number | null }[] };
const parseInstruction = (instruction: string) => {
  const [title, ...body] = instruction.split("\n");
  return { title, description: body.join("\n") || title };
};
const toRecipe = (row: RecipeRow): Recipe => ({
  id: row.id, title: row.title, timeMinutes: row.total_time_minutes, difficulty: row.difficulty,
  calories: row.calories ?? 0, protein: Number(row.protein_grams ?? 0),
  ingredients: [...(row.recipe_ingredients ?? [])].sort((a, b) => a.sort_order - b.sort_order).map((item) => ({
    id: item.id, recipeId: row.id, ingredientId: item.ingredient_id, quantity: item.quantity,
    unit: item.unit, preparation: item.preparation, isOptional: item.is_optional,
  })),
  steps: [...(row.recipe_steps ?? [])].sort((a, b) => a.step_number - b.step_number).map((step): RecipeStep => ({
    id: step.id, stepNumber: step.step_number, ...parseInstruction(step.instruction),
    durationMinutes: step.duration_seconds == null ? undefined : Math.ceil(step.duration_seconds / 60),
  })),
});

export async function fetchRecipes(): Promise<Recipe[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  traceSupabaseRequest("recipes.list", "useRecipes");
  const { data, error } = await client.from("recipes")
    .select("*, recipe_ingredients(*), recipe_steps(*)")
    .order("title");
  if (error) {
    traceSupabaseError("recipes.list", error);
    throw error;
  }
  return (data as unknown as RecipeRow[]).map(toRecipe);
}

/** Fetches only the requested recipe for a deep link or cold detail screen. */
export async function fetchRecipe(id: string): Promise<Recipe | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  traceSupabaseRequest("recipes.detail", "useRecipe", `id=${id}`);
  const { data, error } = await client.from("recipes")
    .select("*, recipe_ingredients(*), recipe_steps(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    traceSupabaseError("recipes.detail", error);
    throw error;
  }
  return data ? toRecipe(data as unknown as RecipeRow) : null;
}
