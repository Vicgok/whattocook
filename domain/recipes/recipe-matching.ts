import {
  Ingredient,
  PantryItem,
  RecipeMatchResult,
} from "@/domain/ingredients/ingredient.types";
import { matchRecipeToPantry } from "@/domain/ingredients/ingredient-matcher";
import { Recipe } from "@/types/recipe";

export type MatchedRecipe = { recipe: Recipe; match: RecipeMatchResult };

export function rankRecipesForPantry(
  recipes: Recipe[],
  pantry: PantryItem[],
  ingredients: Ingredient[],
): MatchedRecipe[] {
  return recipes
    .map((recipe) => ({
      recipe,
      match: matchRecipeToPantry(pantry, recipe.ingredients, ingredients),
    }))
    .sort(
      (a, b) =>
        b.match.matchPercentage - a.match.matchPercentage ||
        a.match.missingIngredients.length - b.match.missingIngredients.length ||
        a.recipe.title.localeCompare(b.recipe.title),
    );
}
