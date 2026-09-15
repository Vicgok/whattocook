import { matchRecipeToPantry } from "../domain/ingredients/ingredient-matcher";
import { initialCookingStepIndex, orderRecipeSteps } from "../domain/cooking/step-navigation";
import { Ingredient, PantryItem, RecipeIngredient } from "../domain/ingredients/ingredient.types";
import { RecipeStep } from "../types/recipe";

const expect = (condition: unknown, message: string) => { if (!condition) throw new Error(message); };
const ingredients: Ingredient[] = [
  { id: "rice", slug: "rice", name: "Rice", categoryId: "grains", aliases: [], searchKeywords: [], isCountable: false, pantryCommon: true },
  { id: "egg", slug: "egg", name: "Egg", categoryId: "eggs", aliases: [], searchKeywords: [], isCountable: true, pantryCommon: true },
];
const pantry: PantryItem[] = [{ id: "1", userId: "u", ingredientId: "rice", createdAt: "", updatedAt: "" }];
const required: RecipeIngredient[] = [
  { id: "a", recipeId: "r", ingredientId: "rice", isOptional: false },
  { id: "b", recipeId: "r", ingredientId: "egg", isOptional: false },
];
const match = matchRecipeToPantry(pantry, required, ingredients);
expect(match.matchPercentage === 50, "required ingredient score is deterministic");
expect(match.missingIngredients.length === 1 && match.missingIngredients[0]?.ingredientId === "egg", "missing required ingredient is reported");
const unordered: RecipeStep[] = [
  { stepNumber: 2, title: "Second", description: "" },
  { stepNumber: 1, title: "First", description: "" },
];
const ordered = orderRecipeSteps(unordered);
expect(ordered[0]?.title === "First", "database step numbers are ordered ascending");
expect(initialCookingStepIndex(ordered) === 0, "first database step maps to UI index zero");
