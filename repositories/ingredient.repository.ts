import {
  Ingredient,
  IngredientCategory,
} from "@/domain/ingredients/ingredient.types";
import { getSupabaseClient } from "@/lib/supabase";
import {
  traceSupabaseError,
  traceSupabaseRequest,
} from "@/lib/supabase-request-tracer";

type IngredientRow = {
  id: string;
  slug: string;
  name: string;
  category_id: string;
  image_path: string | null;
  default_unit: Ingredient["defaultUnit"];
  is_pantry_staple: boolean;
  created_at: string;
  updated_at: string;
  ingredient_aliases?: { alias: string }[];
  ingredient_compatibility_assessments?: {
    requirement_code: string;
    status: "compatible" | "incompatible";
    verified_at: string;
  }[];
  ingredient_dietary_metadata?: { contains_meat: boolean | null; contains_poultry: boolean | null; contains_fish: boolean | null; contains_shellfish: boolean | null; contains_egg: boolean | null; contains_dairy: boolean | null; contains_honey: boolean | null; contains_gluten: boolean | null; ingredient_composition_complete: boolean; verification_status: "unknown" | "proposed" | "verified" } | null;
  ingredient_allergen_metadata?: { allergen_code: string; status: "present" | "not_present" | "unknown"; verification_status: "unknown" | "proposed" | "verified" }[];
};
type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
};

const toIngredient = (row: IngredientRow): Ingredient => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  categoryId: row.category_id,
  aliases: row.ingredient_aliases?.map(({ alias }) => alias) ?? [],
  searchKeywords: [],
  defaultUnit: row.default_unit,
  isCountable: false,
  pantryCommon: row.is_pantry_staple,
  imageKey: row.image_path,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  compatibilityAssessments: (row.ingredient_compatibility_assessments ?? []).map((assessment) => ({
    requirementCode: assessment.requirement_code,
    status: assessment.status,
    verifiedAt: assessment.verified_at,
  })),
  dietaryMetadata: row.ingredient_dietary_metadata ? { containsMeat: row.ingredient_dietary_metadata.contains_meat, containsPoultry: row.ingredient_dietary_metadata.contains_poultry, containsFish: row.ingredient_dietary_metadata.contains_fish, containsShellfish: row.ingredient_dietary_metadata.contains_shellfish, containsEgg: row.ingredient_dietary_metadata.contains_egg, containsDairy: row.ingredient_dietary_metadata.contains_dairy, containsHoney: row.ingredient_dietary_metadata.contains_honey, containsGluten: row.ingredient_dietary_metadata.contains_gluten, ingredientCompositionComplete: row.ingredient_dietary_metadata.ingredient_composition_complete, verificationStatus: row.ingredient_dietary_metadata.verification_status } : undefined,
  allergenMetadata: row.ingredient_allergen_metadata?.map((item) => ({ allergenCode: item.allergen_code, status: item.status, verificationStatus: item.verification_status })),
});

export async function fetchIngredients(
  search = "",
): Promise<Ingredient[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  traceSupabaseRequest(
    "ingredients.list",
    "useIngredients",
    search ? `search=${search}` : "all",
  );
  let query = client
    .from("ingredients")
    .select("*, ingredient_aliases(alias), ingredient_compatibility_assessments(requirement_code,status,verified_at), ingredient_dietary_metadata(*), ingredient_allergen_metadata(allergen_code,status,verification_status)")
    .order("name");
  if (search.trim()) query = query.ilike("name", `%${search.trim()}%`);
  const { data, error } = await query;
  if (error) {
    traceSupabaseError("ingredients.list", error);
    throw error;
  }
  return (data as unknown as IngredientRow[]).map(toIngredient);
}

export async function fetchIngredientCategories(): Promise<
  IngredientCategory[] | null
> {
  const client = getSupabaseClient();
  if (!client) return null;
  traceSupabaseRequest("ingredientCategories.list", "useIngredientCategories");
  const { data, error } = await client
    .from("ingredient_categories")
    .select("*")
    .order("sort_order");
  if (error) {
    traceSupabaseError("ingredientCategories.list", error);
    throw error;
  }
  return (data as unknown as CategoryRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    sortOrder: row.sort_order,
  }));
}
