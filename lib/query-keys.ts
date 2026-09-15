import { CANONICAL_DATA_VERSION } from "./cache-version";

export const queryKeys = {
  ingredients: (search = "") => ["ingredients", CANONICAL_DATA_VERSION, search] as const,
  categories: ["ingredient-categories", CANONICAL_DATA_VERSION] as const,
  pantry: (userId: string) => ["pantry", userId] as const,
  recipes: ["recipes", CANONICAL_DATA_VERSION] as const,
  recipe: (id: string) => ["recipe", CANONICAL_DATA_VERSION, id] as const,
  savedRecipes: (userId: string) => ["saved-recipes", userId] as const,
  preferences: (userId: string) => ["user-preferences", userId] as const,
  cookingSession: (userId: string, recipeId: string) =>
    ["cooking-session", userId, recipeId] as const,
};
