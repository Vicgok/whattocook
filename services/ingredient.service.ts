import { ingredientCategories } from "@/data/ingredient-categories";
import { ingredients as localIngredients } from "@/data/ingredients";
import { searchIngredients } from "@/domain/ingredients/ingredient-search";
import {
  Ingredient,
  IngredientCategory,
} from "@/domain/ingredients/ingredient.types";
import {
  fetchIngredientCategories,
  fetchIngredients,
} from "@/repositories/ingredient.repository";

/** Local catalogue is an offline/bootstrap fallback; Supabase is authoritative when configured. */
export async function listIngredients(search = ""): Promise<Ingredient[]> {
  const remote = await fetchIngredients(search);
  if (remote) return remote;
  return search
    ? searchIngredients(search, localIngredients).map(
        ({ ingredient }) => ingredient,
      )
    : localIngredients;
}
export async function listIngredientCategories(): Promise<
  IngredientCategory[]
> {
  return (await fetchIngredientCategories()) ?? ingredientCategories;
}
