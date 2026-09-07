/** Identity-only catalogue record. User stock belongs in PantryItem. */
export type IngredientUnit = "g" | "kg" | "ml" | "l" | "tsp" | "tbsp" | "cup" | "piece" | "pinch" | "clove" | "slice" | "can";
export type IngredientCategory = { id: string; slug: string; name: string; sortOrder: number };
export type Ingredient = {
  id: string; slug: string; name: string; categoryId: string; subcategory?: string | null;
  aliases: string[]; searchKeywords: string[]; defaultUnit?: IngredientUnit | null;
  isCountable: boolean; pantryCommon: boolean; imageKey?: string | null;
  /** A broader ingredient may be satisfied by this variant in deterministic matching. */
  parentIngredientId?: string | null;
  createdAt?: string; updatedAt?: string;
};
export type PantryStorageLocation = "pantry" | "fridge" | "freezer";
export type PantryItem = { id: string; userId: string; ingredientId: string; quantity?: number | null; unit?: IngredientUnit | null; expiryDate?: string | null; storageLocation?: PantryStorageLocation | null; createdAt: string; updatedAt: string };
export type RecipeIngredient = { id: string; recipeId: string; ingredientId: string; quantity?: number | null; unit?: IngredientUnit | null; preparation?: string | null; isOptional: boolean; rawText?: string | null };
export type RecipeMatchResult = { matchedIngredients: RecipeIngredient[]; missingIngredients: RecipeIngredient[]; optionalMissingIngredients: RecipeIngredient[]; matchedRequiredCount: number; totalRequiredCount: number; matchPercentage: number; canCook: boolean; matchTier: "ready" | "high" | "good" | "partial" | "low" };
