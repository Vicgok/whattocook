import {
  Ingredient,
  IngredientCategory,
  IngredientUnit,
} from "./ingredient.types";
import { normalizeIngredientText } from "./ingredient-normalizer";

const validUnits = new Set<IngredientUnit>([
  "g",
  "kg",
  "ml",
  "l",
  "tsp",
  "tbsp",
  "cup",
  "piece",
  "pinch",
  "clove",
  "slice",
  "can",
]);

export function validateIngredientDataset(
  ingredients: Ingredient[],
  categories: IngredientCategory[],
): string[] {
  const issues: string[] = [];
  const ids = new Set<string>(),
    slugs = new Set<string>(),
    names = new Set<string>(),
    aliases = new Map<string, string>();
  const categoryIds = new Set(categories.map((category) => category.id));
  const canonicalNames = new Map(
    ingredients.map((ingredient) => [
      normalizeIngredientText(ingredient.name),
      ingredient.id,
    ]),
  );
  for (const ingredient of ingredients) {
    const nameKey = normalizeIngredientText(ingredient.name);
    if (!ingredient.id || !ingredient.slug || !ingredient.name)
      issues.push(
        `missing required field: ${ingredient.id || ingredient.name || "unknown"}`,
      );
    if (ids.has(ingredient.id)) issues.push(`duplicate id: ${ingredient.id}`);
    ids.add(ingredient.id);
    if (slugs.has(ingredient.slug))
      issues.push(`duplicate slug: ${ingredient.slug}`);
    slugs.add(ingredient.slug);
    if (names.has(nameKey))
      issues.push(`duplicate canonical name: ${ingredient.name}`);
    names.add(nameKey);
    if (!categoryIds.has(ingredient.categoryId))
      issues.push(
        `unknown category: ${ingredient.categoryId} on ${ingredient.id}`,
      );
    if (ingredient.defaultUnit && !validUnits.has(ingredient.defaultUnit))
      issues.push(
        `invalid unit: ${ingredient.defaultUnit} on ${ingredient.id}`,
      );
    if (/^\d|\b(chopped|diced|minced|grated|boiled)\b/i.test(ingredient.name))
      issues.push(
        `identity contains quantity or preparation: ${ingredient.name}`,
      );
    const localAliases = new Set<string>();
    for (const term of ingredient.aliases) {
      const key = normalizeIngredientText(term);
      if (!key) {
        issues.push(`empty alias on ${ingredient.id}`);
        continue;
      }
      if (localAliases.has(key))
        issues.push(`duplicate alias on ${ingredient.id}: ${term}`);
      localAliases.add(key);
      if (key === nameKey) issues.push(`redundant alias: ${term}`);
      const canonicalOwner = canonicalNames.get(key);
      if (canonicalOwner && canonicalOwner !== ingredient.id)
        issues.push(
          `alias conflicts with canonical name: ${term} (${canonicalOwner}, ${ingredient.id})`,
        );
      const owner = aliases.get(key);
      if (owner && owner !== ingredient.id)
        issues.push(`alias collision: ${term} (${owner}, ${ingredient.id})`);
      aliases.set(key, ingredient.id);
    }
    const localKeywords = new Set<string>();
    for (const term of ingredient.searchKeywords) {
      const key = normalizeIngredientText(term);
      if (!key) issues.push(`empty search keyword on ${ingredient.id}`);
      else if (localKeywords.has(key))
        issues.push(`duplicate search keyword on ${ingredient.id}: ${term}`);
      localKeywords.add(key);
    }
  }
  return issues;
}
