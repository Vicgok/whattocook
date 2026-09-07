export type IngredientStatus = "owned" | "missing" | "optional";
export type Recipe = {
  id: string; title: string; timeMinutes: number; difficulty: "Easy" | "Medium" | "Hard"; calories: number; protein: number;
  ingredientMatch: { owned: number; total: number };
  ingredients: { name: string; status: IngredientStatus }[];
  steps: { title: string; description: string; durationMinutes?: number }[];
};
