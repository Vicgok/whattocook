import { ingredients } from "../data/ingredients";
import { ingredientCategories } from "../data/ingredient-categories";
import { recipes } from "../data/mockRecipes";
import { matchRecipeToPantry } from "../domain/ingredients/ingredient-matcher";
import { resolveIngredient } from "../domain/ingredients/ingredient-normalizer";
import { searchIngredients } from "../domain/ingredients/ingredient-search";
import { validateIngredientDataset } from "../domain/ingredients/ingredient-validator";
import {
  PantryItem,
  RecipeIngredient,
} from "../domain/ingredients/ingredient.types";
const expect = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};
const resolve = (term: string) => resolveIngredient(term, ingredients)?.id;
expect(
  resolve("capsicum") === "bell-pepper",
  "capsicum resolves to Bell Pepper",
);
expect(resolve("aubergine") === "eggplant", "aubergine resolves to Eggplant");
expect(resolve("brinjal") === "eggplant", "brinjal resolves to Eggplant");
expect(
  resolve("coriander leaves") === "cilantro",
  "coriander leaves resolves to Cilantro",
);
expect(
  resolve("garbanzo beans") === "chickpeas",
  "garbanzo beans resolves to Chickpeas",
);
expect(
  searchIngredients("caps", ingredients)[0]?.ingredient.id === "bell-pepper",
  "alias prefix search ranks Bell Pepper",
);
expect(
  searchIngredients("beans", ingredients).some(
    ({ ingredient }) => ingredient.id === "cannellini-beans",
  ),
  "word search finds Cannellini Beans",
);
expect(
  searchIngredients("BAINGAN", ingredients)[0]?.ingredient.id === "eggplant",
  "case-insensitive keyword search ranks Eggplant",
);
expect(
  searchIngredients("   ", ingredients).length > 0,
  "whitespace search returns common catalog ingredients",
);
expect(
  searchIngredients("not-an-ingredient", ingredients).length === 0,
  "unknown search has no results",
);
const pantry = (...ids: string[]): PantryItem[] =>
  ids.map((ingredientId, index) => ({
    id: `p${index}`,
    userId: "u",
    ingredientId,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  }));
const recipe = (...rows: [string, boolean?][]): RecipeIngredient[] =>
  rows.map(([ingredientId, isOptional], index) => ({
    id: `r${index}`,
    recipeId: "r",
    ingredientId,
    isOptional: !!isOptional,
  }));
expect(
  matchRecipeToPantry(pantry("red-onion"), recipe(["onion"]), ingredients)
    .matchPercentage === 100,
  "red onion satisfies onion",
);
expect(
  matchRecipeToPantry(pantry("onion"), recipe(["onion"]), ingredients)
    .matchPercentage === 100,
  "preparation stays outside identity",
);
expect(
  matchRecipeToPantry(
    pantry("greek-yogurt"),
    recipe(["sour-cream"]),
    ingredients,
  ).matchPercentage === 0,
  "no implicit substitution",
);
expect(
  matchRecipeToPantry([], recipe(["tomato"], ["rice"]), ingredients)
    .matchPercentage === 0,
  "empty pantry has no required matches",
);
expect(
  matchRecipeToPantry(
    pantry("tomato", "tomato"),
    recipe(["tomato"]),
    ingredients,
  ).matchedRequiredCount === 1,
  "duplicate pantry IDs do not double-count matches",
);
expect(
  matchRecipeToPantry(pantry("unknown-id"), recipe(["tomato"]), ingredients)
    .matchPercentage === 0,
  "invalid pantry IDs do not match catalog ingredients",
);
expect(
  matchRecipeToPantry([], recipe(["cilantro", true]), ingredients)
    .matchPercentage === 100,
  "recipes with only optional ingredients have a safe full match",
);
const match = matchRecipeToPantry(
  pantry("tomato", "rice", "onion"),
  recipe(["tomato"], ["onion"], ["garlic"], ["rice"], ["cilantro", true]),
  ingredients,
);
expect(
  match.matchPercentage === 75 &&
    match.missingIngredients[0]?.ingredientId === "garlic",
  "required match is 75 percent and optional does not penalize",
);
const bowlMatch = matchRecipeToPantry(
  pantry("chicken", "egg", "rice", "tomato", "onion"),
  recipes[0].ingredients,
  ingredients,
);
expect(
  bowlMatch.matchedRequiredCount === 5 &&
    bowlMatch.totalRequiredCount === 6 &&
    bowlMatch.missingIngredients[0]?.ingredientId === "greek-yogurt",
  "five owned required ingredients leaves Greek Yogurt missing",
);
const optionalMatch = matchRecipeToPantry(
  pantry("chicken", "rice", "onion", "egg", "bell-pepper", "soy-sauce"),
  recipes[1].ingredients,
  ingredients,
);
expect(
  optionalMatch.matchPercentage === 100 &&
    optionalMatch.optionalMissingIngredients[0]?.ingredientId ===
      "red-pepper-flakes",
  "optional ingredients do not reduce a complete match",
);
expect(
  recipes.every((recipe) =>
    recipe.ingredients.every((item) =>
      ingredients.some((ingredient) => ingredient.id === item.ingredientId),
    ),
  ),
  "every mock recipe ingredient maps to the canonical catalog",
);
expect(
  recipes.every(
    (recipe) =>
      new Set(recipe.ingredients.map((item) => item.id)).size ===
      recipe.ingredients.length,
  ),
  "mock recipes do not duplicate recipe ingredient IDs",
);
expect(
  validateIngredientDataset(ingredients, ingredientCategories).length === 0,
  "seed dataset validates",
);
