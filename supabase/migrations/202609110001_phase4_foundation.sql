-- WhatToCook Phase 4 MVP. Run with `supabase db push`.
create extension if not exists "pgcrypto";

-- Profiles are commonly created by an earlier Auth setup. Preserve that table
-- and add the fields WhatToCook needs instead of requiring it to be dropped.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text, avatar_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
create table if not exists public.ingredient_categories (
  id text primary key, name text not null, slug text not null unique, sort_order integer not null check (sort_order > 0), created_at timestamptz not null default now()
);
create table if not exists public.ingredients (
  id text primary key, name text not null, slug text not null unique, category_id text not null references public.ingredient_categories(id), image_path text,
  default_unit text, is_pantry_staple boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.ingredient_aliases (
  id uuid primary key default gen_random_uuid(), ingredient_id text not null references public.ingredients(id) on delete cascade,
  alias text not null, normalized_alias text not null unique, created_at timestamptz not null default now()
);
create table if not exists public.recipes (
  id text primary key, title text not null, slug text not null unique, description text, image_path text,
  prep_time_minutes integer check (prep_time_minutes >= 0), cook_time_minutes integer check (cook_time_minutes >= 0), total_time_minutes integer not null check (total_time_minutes >= 0),
  servings integer check (servings > 0), difficulty text not null check (difficulty in ('Easy','Medium','Hard')), source_type text not null default 'editorial' check (source_type in ('editorial','ai')), calories integer, protein_grams numeric,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(), recipe_id text not null references public.recipes(id) on delete cascade, ingredient_id text not null references public.ingredients(id),
  quantity numeric check (quantity is null or quantity >= 0), unit text, preparation text, is_optional boolean not null default false, sort_order integer not null check (sort_order >= 0), unique(recipe_id, ingredient_id)
);
create table if not exists public.recipe_steps (
  id uuid primary key default gen_random_uuid(), recipe_id text not null references public.recipes(id) on delete cascade,
  step_number integer not null check (step_number > 0), instruction text not null, duration_seconds integer check (duration_seconds is null or duration_seconds >= 0), created_at timestamptz not null default now(), unique(recipe_id, step_number)
);
create table if not exists public.user_pantry_items (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, ingredient_id text not null references public.ingredients(id),
  quantity numeric check (quantity is null or quantity >= 0), unit text, expires_at date, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id, ingredient_id)
);
create table if not exists public.saved_recipes (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, recipe_id text not null references public.recipes(id) on delete cascade, created_at timestamptz not null default now(), unique(user_id, recipe_id)
);
create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id) on delete cascade, diet jsonb not null default '[]'::jsonb, allergies jsonb not null default '[]'::jsonb, nutrition_goals jsonb not null default '[]'::jsonb, cooking_preferences jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.cooking_sessions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, recipe_id text not null references public.recipes(id) on delete cascade,
  current_step integer not null default 0 check (current_step >= 0), started_at timestamptz not null default now(), completed_at timestamptz, status text not null default 'in_progress' check (status in ('in_progress','completed','abandoned')), updated_at timestamptz not null default now()
);

create index if not exists ingredients_category_id_idx on public.ingredients(category_id);
create index if not exists ingredient_aliases_ingredient_id_idx on public.ingredient_aliases(ingredient_id);
create index if not exists recipe_ingredients_recipe_id_idx on public.recipe_ingredients(recipe_id);
create index if not exists recipe_steps_recipe_id_step_number_idx on public.recipe_steps(recipe_id, step_number);
create index if not exists user_pantry_items_user_id_idx on public.user_pantry_items(user_id);
create index if not exists saved_recipes_user_id_idx on public.saved_recipes(user_id);
create index if not exists cooking_sessions_user_recipe_status_idx on public.cooking_sessions(user_id, recipe_id, status);

alter table public.profiles enable row level security;
alter table public.user_pantry_items enable row level security;
alter table public.saved_recipes enable row level security;
alter table public.user_preferences enable row level security;
alter table public.cooking_sessions enable row level security;
alter table public.ingredient_categories enable row level security;
alter table public.ingredients enable row level security;
alter table public.ingredient_aliases enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_steps enable row level security;

drop policy if exists "profiles are private" on public.profiles;
drop policy if exists "pantry is private" on public.user_pantry_items;
drop policy if exists "saved recipes are private" on public.saved_recipes;
drop policy if exists "preferences are private" on public.user_preferences;
drop policy if exists "cooking sessions are private" on public.cooking_sessions;
drop policy if exists "catalogue read access" on public.ingredient_categories;
drop policy if exists "ingredients read access" on public.ingredients;
drop policy if exists "aliases read access" on public.ingredient_aliases;
drop policy if exists "recipes read access" on public.recipes;
drop policy if exists "recipe ingredients read access" on public.recipe_ingredients;
drop policy if exists "recipe steps read access" on public.recipe_steps;
create policy "profiles are private" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "pantry is private" on public.user_pantry_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "saved recipes are private" on public.saved_recipes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "preferences are private" on public.user_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cooking sessions are private" on public.cooking_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "catalogue read access" on public.ingredient_categories for select using (true);
create policy "ingredients read access" on public.ingredients for select using (true);
create policy "aliases read access" on public.ingredient_aliases for select using (true);
create policy "recipes read access" on public.recipes for select using (true);
create policy "recipe ingredients read access" on public.recipe_ingredients for select using (true);
create policy "recipe steps read access" on public.recipe_steps for select using (true);

-- Client mutations are intentionally limited to user-owned rows by RLS. Canonical data is seeded/admin-only.
