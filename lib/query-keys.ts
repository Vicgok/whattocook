export const queryKeys = {
  ingredients: (search = "") => ["ingredients", search] as const,
  categories: ["ingredient-categories"] as const,
  pantry: (userId: string) => ["pantry", userId] as const,
  recipes: ["recipes"] as const,
  recipe: (id: string) => ["recipe", id] as const,
  savedRecipes: (userId: string) => ["saved-recipes", userId] as const,
  cookingSession: (userId: string, recipeId: string) =>
    ["cooking-session", userId, recipeId] as const,
};
