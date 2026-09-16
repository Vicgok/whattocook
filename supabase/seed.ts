/* Generates idempotent seed SQL from the app's existing canonical source of truth.
   Run: npx tsx supabase/seed.ts > supabase/seed.sql */
import { ingredientCategories } from "../data/ingredient-categories";
import { ingredients } from "../data/ingredients";
import { recipes } from "../data/mockRecipes";

const quote = (value: string | null | undefined) =>
  value == null ? "null" : `'${value.replaceAll("'", "''")}'`;
const bool = (value: boolean) => (value ? "true" : "false");

console.log("begin;");
for (const category of ingredientCategories)
  console.log(
    `insert into public.ingredient_categories (id,name,slug,sort_order) values (${quote(category.id)},${quote(category.name)},${quote(category.slug)},${category.sortOrder}) on conflict (id) do update set name=excluded.name, slug=excluded.slug, sort_order=excluded.sort_order;`,
  );
for (const ingredient of ingredients) {
  console.log(
    `insert into public.ingredients (id,name,slug,category_id,image_path,default_unit,is_pantry_staple) values (${quote(ingredient.id)},${quote(ingredient.name)},${quote(ingredient.slug)},${quote(ingredient.categoryId)},${quote(ingredient.imageKey ?? `ingredients/${ingredient.slug}.webp`)},${quote(ingredient.defaultUnit)},${bool(ingredient.pantryCommon)}) on conflict (id) do update set name=excluded.name, slug=excluded.slug, category_id=excluded.category_id, image_path=excluded.image_path, default_unit=excluded.default_unit, is_pantry_staple=excluded.is_pantry_staple;`,
  );
  for (const alias of ingredient.aliases) {
    const normalized = alias.trim().toLocaleLowerCase("en-US");
    console.log(
      `insert into public.ingredient_aliases (ingredient_id,alias,normalized_alias) values (${quote(ingredient.id)},${quote(alias)},${quote(normalized)}) on conflict (normalized_alias) do update set ingredient_id=excluded.ingredient_id, alias=excluded.alias;`,
    );
  }
}
for (const recipe of recipes) {
  console.log(
    `insert into public.recipes (id,title,slug,total_time_minutes,difficulty,calories,protein_grams) values (${quote(recipe.id)},${quote(recipe.title)},${quote(recipe.id)},${recipe.timeMinutes},${quote(recipe.difficulty)},${recipe.calories},${recipe.protein}) on conflict (id) do update set title=excluded.title, total_time_minutes=excluded.total_time_minutes, difficulty=excluded.difficulty, calories=excluded.calories, protein_grams=excluded.protein_grams;`,
  );
  recipe.ingredients.forEach((item, index) =>
    console.log(
      `insert into public.recipe_ingredients (recipe_id,ingredient_id,quantity,unit,preparation,is_optional,sort_order) values (${quote(recipe.id)},${quote(item.ingredientId)},${item.quantity ?? "null"},${quote(item.unit)},${quote(item.preparation)},${bool(item.isOptional)},${index}) on conflict (recipe_id,ingredient_id) do update set quantity=excluded.quantity, unit=excluded.unit, preparation=excluded.preparation, is_optional=excluded.is_optional, sort_order=excluded.sort_order;`,
    ),
  );
  recipe.steps.forEach((step) =>
    console.log(
      `insert into public.recipe_steps (recipe_id,step_number,instruction,duration_seconds) values (${quote(recipe.id)},${step.stepNumber},${quote(`${step.title}\n${step.description}`)},${(step.durationMinutes ?? 0) * 60}) on conflict (recipe_id,step_number) do update set instruction=excluded.instruction, duration_seconds=excluded.duration_seconds;`,
    ),
  );
}
console.log("commit;");
