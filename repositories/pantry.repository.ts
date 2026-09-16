import { PantryItem } from "@/domain/ingredients/ingredient.types";
import { getSupabaseClient } from "@/lib/supabase";
import {
  traceSupabaseError,
  traceSupabaseRequest,
} from "@/lib/supabase-request-tracer";

type PantryRow = {
  id: string;
  user_id: string;
  ingredient_id: string;
  quantity: number | null;
  unit: PantryItem["unit"];
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};
const toPantryItem = (row: PantryRow): PantryItem => ({
  id: row.id,
  userId: row.user_id,
  ingredientId: row.ingredient_id,
  quantity: row.quantity,
  unit: row.unit,
  expiryDate: row.expires_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function fetchPantryItems(userId: string): Promise<PantryItem[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  traceSupabaseRequest("pantry.list", "useRemotePantry");
  const { data, error } = await client
    .from("user_pantry_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at");
  if (error) {
    traceSupabaseError("pantry.list", error);
    throw error;
  }
  return (data as unknown as PantryRow[]).map(toPantryItem);
}

export async function upsertPantryIngredients(
  userId: string,
  ingredientIds: string[],
): Promise<PantryItem[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");
  const uniqueIngredientIds = [...new Set(ingredientIds)];
  if (uniqueIngredientIds.length === 0) return [];
  traceSupabaseRequest(
    "pantry.upsert",
    "useRemotePantry.addIngredients",
    `count=${uniqueIngredientIds.length}`,
  );
  const { data, error } = await client
    .from("user_pantry_items")
    .upsert(
      uniqueIngredientIds.map((ingredientId) => ({
        user_id: userId,
        ingredient_id: ingredientId,
      })),
      { onConflict: "user_id,ingredient_id" },
    )
    .select();
  if (error) {
    traceSupabaseError("pantry.upsert", error);
    throw error;
  }
  return (data as unknown as PantryRow[]).map(toPantryItem);
}

export async function deletePantryIngredient(
  userId: string,
  ingredientId: string,
): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");
  traceSupabaseRequest("pantry.delete", "useRemotePantry.removeIngredient");
  const { error } = await client
    .from("user_pantry_items")
    .delete()
    .eq("user_id", userId)
    .eq("ingredient_id", ingredientId);
  if (error) {
    traceSupabaseError("pantry.delete", error);
    throw error;
  }
}
