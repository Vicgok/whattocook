-- Query-path indexes added after the Phase 4 foundation migration.
-- The existing uniqueness constraints already index ingredients.slug,
-- ingredient_aliases.normalized_alias, recipe_steps(recipe_id, step_number),
-- user_pantry_items(user_id, ingredient_id), and saved_recipes(user_id, recipe_id).

-- fetchPantryItems filters by owner and orders by creation time.
create index if not exists user_pantry_items_user_created_at_idx
  on public.user_pantry_items(user_id, created_at);

-- fetchActiveCookingSession filters on these three columns and asks for the
-- most recently updated row. This avoids a sort after the index lookup.
create index if not exists cooking_sessions_active_lookup_idx
  on public.cooking_sessions(user_id, recipe_id, status, updated_at desc);
