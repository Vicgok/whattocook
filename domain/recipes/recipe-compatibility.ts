import { Ingredient, CompatibilityAssessment } from "../ingredients/ingredient.types";
import { Recipe } from "../../types/recipe";

export type CompatibilityResult = "COMPATIBLE" | "INCOMPATIBLE" | "UNKNOWN";
export type CompatibilityPreferences = {
  dietPreferences: string[];
  allergies: string[];
  avoidedIngredientIds: string[];
};

const codeForPreference = (value: string) =>
  value.trim().toLocaleLowerCase("en-US").replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const assessmentFor = (assessments: CompatibilityAssessment[] | undefined, code: string) =>
  assessments?.find((assessment) => assessment.requirementCode === code);

/**
 * Conservative, data-only evaluation. A compatible assessment is not an
 * allergen-free or cross-contact guarantee; it only means all required
 * verified recipe data supports this compatibility requirement.
 */
export function evaluateRecipeCompatibility(
  recipe: Recipe,
  ingredients: Ingredient[],
  preferences: CompatibilityPreferences,
): CompatibilityResult {
  const recipeIngredientIds = new Set(recipe.ingredients.map((item) => item.ingredientId));
  if (preferences.avoidedIngredientIds.some((id) => recipeIngredientIds.has(id))) return "INCOMPATIBLE";

  const requirements = [...preferences.dietPreferences, ...preferences.allergies]
    .map(codeForPreference)
    .filter((code) => code && code !== "no-preference");
  if (requirements.length === 0) return "COMPATIBLE";

  const ingredientsById = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));
  let unknown = false;
  for (const requirement of new Set(requirements)) {
    const recipeAssessment = assessmentFor(recipe.compatibilityAssessments, requirement);
    if (recipeAssessment?.status === "incompatible") return "INCOMPATIBLE";
    if (recipeAssessment?.status === "compatible") continue;
    if (recipe.ingredients.length === 0) {
      unknown = true;
      continue;
    }
    let allIngredientsCompatible = true;
    for (const item of recipe.ingredients) {
      const ingredient = ingredientsById.get(item.ingredientId);
      const assessment = assessmentFor(ingredient?.compatibilityAssessments, requirement);
      if (assessment?.status === "incompatible") return "INCOMPATIBLE";
      if (assessment?.status !== "compatible") allIngredientsCompatible = false;
    }
    if (!allIngredientsCompatible) unknown = true;
  }
  return unknown ? "UNKNOWN" : "COMPATIBLE";
}

export function filterCompatibleRecipes(
  recipes: Recipe[],
  ingredients: Ingredient[],
  preferences: CompatibilityPreferences,
) {
  return recipes.filter((recipe) =>
    evaluateRecipeCompatibility(recipe, ingredients, preferences) === "COMPATIBLE",
  );
}
