import { recipes as localRecipes } from "@/data/mockRecipes";
import { Recipe } from "@/types/recipe";
import { fetchRecipe, fetchRecipes } from "@/repositories/recipe.repository";

export async function listRecipes(): Promise<Recipe[]> {
  return (await fetchRecipes()) ?? localRecipes;
}
export async function getRecipe(id: string): Promise<Recipe | undefined> {
  return (await fetchRecipe(id)) ?? localRecipes.find((recipe) => recipe.id === id);
}
