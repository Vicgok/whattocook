import { RecipeIngredient } from "../domain/ingredients/ingredient.types";
import { CompatibilityAssessment } from "../domain/ingredients/ingredient.types";

export type Recipe = {
  id: string;
  title: string;
  timeMinutes: number;
  difficulty: "Easy" | "Medium" | "Hard";
  calories: number;
  protein: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  compatibilityAssessments?: CompatibilityAssessment[];
};

/** Database steps are one-based; UI state always uses the array's zero-based index. */
export type RecipeStep = {
  id?: string;
  stepNumber: number;
  title: string;
  description: string;
  durationMinutes?: number;
};
