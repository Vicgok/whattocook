import { RecipeIngredient } from "../domain/ingredients/ingredient.types";

export type Recipe = {
  id: string; title: string; timeMinutes: number; difficulty: "Easy" | "Medium" | "Hard"; calories: number; protein: number;
  ingredients: RecipeIngredient[];
  steps: { title: string; description: string; durationMinutes?: number }[];
};
