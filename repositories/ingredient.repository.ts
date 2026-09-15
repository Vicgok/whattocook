import { Ingredient, IngredientCategory } from "@/domain/ingredients/ingredient.types";
import { getSupabaseClient } from "@/lib/supabase";
import { traceSupabaseError, traceSupabaseRequest } from "@/lib/supabase-request-tracer";

type IngredientRow = {
  id: string; slug: string; name: string; category_id: string;
  image_path: string | null; default_unit: Ingredient["defaultUnit"];
  is_pantry_staple: boolean; created_at: string; updated_at: string;
  ingredient_aliases?: { alias: string }[];
};
type CategoryRow = { id: string; slug: string; name: string; sort_order: number };

const toIngredient = (row: IngredientRow): Ingredient => ({
  id: row.id, slug: row.slug, name: row.name, categoryId: row.category_id,
  aliases: row.ingredient_aliases?.map(({ alias }) => alias) ?? [],
  searchKeywords: [], defaultUnit: row.default_unit,
  isCountable: false, pantryCommon: row.is_pantry_staple, imageKey: row.image_path,
  createdAt: row.created_at, updatedAt: row.updated_at,
});

export async function fetchIngredients(search = ""): Promise<Ingredient[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  traceSupabaseRequest("ingredients.list", "useIngredients", search ? `search=${search}` : "all");
  let query = client.from("ingredients").select("*, ingredient_aliases(alias)").order("name");
  if (search.trim()) query = query.ilike("name", `%${search.trim()}%`);
  const { data, error } = await query;
  if (error) {
    traceSupabaseError("ingredients.list", error);
    throw error;
  }
  return (data as unknown as IngredientRow[]).map(toIngredient);
}

export async function fetchIngredientCategories(): Promise<IngredientCategory[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  traceSupabaseRequest("ingredientCategories.list", "useIngredientCategories");
  const { data, error } = await client.from("ingredient_categories").select("*").order("sort_order");
  if (error) {
    traceSupabaseError("ingredientCategories.list", error);
    throw error;
  }
  return (data as unknown as CategoryRow[]).map((row) => ({
    id: row.id, slug: row.slug, name: row.name, sortOrder: row.sort_order,
  }));
}
