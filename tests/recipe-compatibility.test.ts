import { Ingredient, RecipeIngredient } from "../domain/ingredients/ingredient.types";
import { evaluateRecipeCompatibility, filterCompatibleRecipes } from "../domain/recipes/recipe-compatibility";
import { rankRecipesForPantry } from "../domain/recipes/recipe-matching";
import { resolveIngredient } from "../domain/ingredients/ingredient-normalizer";
import { Recipe } from "../types/recipe";

const expect = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};
const dietary = (data: Partial<NonNullable<Ingredient["dietaryMetadata"]>>) => ({ ingredientCompositionComplete: true, verificationStatus: "verified" as const, ...data });
const ingredients: Ingredient[] = [
  { id: "milk", slug: "milk", name: "Milk", categoryId: "dairy", aliases: ["whole milk"], searchKeywords: [], isCountable: false, pantryCommon: true, dietaryMetadata: dietary({ containsDairy: true }), allergenMetadata: [{ allergenCode: "milk", status: "present", verificationStatus: "verified" }] },
  { id: "rice", slug: "rice", name: "Rice", categoryId: "grains", aliases: [], searchKeywords: [], isCountable: false, pantryCommon: true, dietaryMetadata: dietary({ containsDairy: false, containsGluten: false }) },
  { id: "unknown", slug: "unknown", name: "Unknown", categoryId: "other", aliases: [], searchKeywords: [], isCountable: false, pantryCommon: false },
];
const item = (ingredientId: string, isOptional = false): RecipeIngredient => ({ id: ingredientId, recipeId: "r", ingredientId, isOptional });
const recipe = (id: string, rows: RecipeIngredient[]): Recipe => ({ id, title: id, timeMinutes: 10, difficulty: "Easy", calories: 0, protein: 0, ingredients: rows, steps: [] });
const preference = (overrides: Partial<{ dietPreferences: string[]; allergies: string[]; avoidedIngredientIds: string[] }> = {}) => ({ dietPreferences: [], allergies: [], avoidedIngredientIds: [], ...overrides });

expect(resolveIngredient("whole milk", ingredients)?.id === "milk", "aliases resolve to their canonical ingredient ID");
expect(evaluateRecipeCompatibility(recipe("avoid", [item("rice")]), ingredients, preference({ avoidedIngredientIds: ["rice"] })).status === "INCOMPATIBLE", "explicit avoided canonical ingredients are incompatible");
expect(evaluateRecipeCompatibility(recipe("allergen", [item("milk")]), ingredients, preference({ allergies: ["Milk / Dairy"] })).status === "INCOMPATIBLE", "verified allergen conflicts are incompatible");
expect(evaluateRecipeCompatibility(recipe("diet", [item("milk")]), ingredients, preference({ dietPreferences: ["Vegan"] })).status === "INCOMPATIBLE", "verified dietary conflicts are incompatible");
expect(evaluateRecipeCompatibility(recipe("multiple", [item("milk"), item("unknown")]), ingredients, preference({ dietPreferences: ["Vegan"], allergies: ["Milk / Dairy"] })).status === "INCOMPATIBLE", "known conflicts take precedence over incomplete metadata");
expect(evaluateRecipeCompatibility(recipe("unknown", [item("unknown")]), ingredients, preference({ dietPreferences: ["Vegan"] })).status === "UNKNOWN", "missing ingredient metadata remains unknown");
expect(evaluateRecipeCompatibility(recipe("empty", []), ingredients, preference({ allergies: ["Milk / Dairy"] })).status === "UNKNOWN", "an empty ingredient set without recipe verification is unknown");
expect(evaluateRecipeCompatibility(recipe("none", [item("unknown")]), ingredients, preference()).status === "COMPATIBLE", "no selected restrictions do not suppress ordinary discovery");
expect(evaluateRecipeCompatibility(recipe("optional", [item("rice"), item("milk", true)]), ingredients, preference({ dietPreferences: ["Vegan"] })).status === "INCOMPATIBLE", "optional ingredients are evaluated as written");
const filtered = filterCompatibleRecipes([recipe("unknown", [item("unknown")]), recipe("rice", [item("rice")])], ingredients, preference({ dietPreferences: ["Vegan"] }));
expect(filtered.map((entry) => entry.id).join(",") === "rice", "unknown recipes are excluded before ranking under restrictions");
expect(rankRecipesForPantry(filtered, [], ingredients)[0]?.recipe.id === "rice", "filtering preserves the established ranking pipeline");
