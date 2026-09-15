import { getSupabaseClient } from "@/lib/supabase";

const INGREDIENT_BUCKET = "ingredient-images";

export function ingredientImageUrl(imagePath?: string | null): string | null {
  if (!imagePath) return null;
  const client = getSupabaseClient();
  if (!client) return null;
  return client.storage.from(INGREDIENT_BUCKET).getPublicUrl(imagePath).data
    .publicUrl;
}
