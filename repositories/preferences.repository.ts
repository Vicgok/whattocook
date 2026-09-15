import type { UserPreferences } from "@/context/AppContext";
import { getSupabaseClient } from "@/lib/supabase";
import { traceSupabaseError, traceSupabaseRequest } from "@/lib/supabase-request-tracer";

type PreferencesRow = {
  diet: string[];
  allergies: string[];
  nutrition_goals: string[];
  cooking_preferences: Partial<Pick<UserPreferences, "avoidedIngredients" | "units" | "notificationsEnabled" | "appearance">> | null;
};

const toPreferences = (row: PreferencesRow): UserPreferences => ({
  dietPreferences: row.diet,
  allergies: row.allergies,
  nutritionGoals: row.nutrition_goals,
  avoidedIngredients: row.cooking_preferences?.avoidedIngredients ?? [],
  units: row.cooking_preferences?.units ?? "Metric",
  notificationsEnabled: row.cooking_preferences?.notificationsEnabled ?? true,
  appearance: row.cooking_preferences?.appearance ?? "System default",
});

export async function fetchPreferences(userId: string): Promise<UserPreferences | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  traceSupabaseRequest("preferences.get", "useUserPreferences");
  const { data, error } = await client.from("user_preferences").select("diet, allergies, nutrition_goals, cooking_preferences").eq("user_id", userId).maybeSingle();
  if (error) {
    traceSupabaseError("preferences.get", error);
    throw error;
  }
  return data ? toPreferences(data as PreferencesRow) : null;
}

export async function upsertPreferences(userId: string, preferences: UserPreferences): Promise<UserPreferences> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");
  traceSupabaseRequest("preferences.upsert", "useUserPreferences.update");
  const { data, error } = await client.from("user_preferences").upsert({
    user_id: userId,
    diet: preferences.dietPreferences,
    allergies: preferences.allergies,
    nutrition_goals: preferences.nutritionGoals,
    cooking_preferences: {
      avoidedIngredients: preferences.avoidedIngredients,
      units: preferences.units,
      notificationsEnabled: preferences.notificationsEnabled,
      appearance: preferences.appearance,
    },
  }, { onConflict: "user_id" }).select("diet, allergies, nutrition_goals, cooking_preferences").single();
  if (error) {
    traceSupabaseError("preferences.upsert", error);
    throw error;
  }
  return toPreferences(data as PreferencesRow);
}
