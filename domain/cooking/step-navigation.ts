import { RecipeStep } from "../../types/recipe";

export function orderRecipeSteps(steps: RecipeStep[]): RecipeStep[] {
  return [...steps].sort((a, b) => a.stepNumber - b.stepNumber);
}

/** Converts the first one-based database step to its zero-based UI index. */
export function initialCookingStepIndex(steps: RecipeStep[]): number {
  return orderRecipeSteps(steps).length > 0 ? 0 : -1;
}
