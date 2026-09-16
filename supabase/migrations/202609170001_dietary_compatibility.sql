-- Verified dietary/allergen compatibility. Existing records intentionally receive
-- no assessments: missing evidence is UNKNOWN, never implicitly compatible.
create table if not exists public.compatibility_requirements (
  code text primary key,
  kind text not null check (kind in ('diet', 'allergen')),
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ingredient_compatibility_assessments (
  ingredient_id text not null references public.ingredients(id) on delete cascade,
  requirement_code text not null references public.compatibility_requirements(code) on delete restrict,
  status text not null check (status in ('compatible', 'incompatible')),
  verified_at timestamptz not null,
  source_note text not null,
  primary key (ingredient_id, requirement_code)
);

create table if not exists public.recipe_compatibility_assessments (
  recipe_id text not null references public.recipes(id) on delete cascade,
  requirement_code text not null references public.compatibility_requirements(code) on delete restrict,
  status text not null check (status in ('compatible', 'incompatible')),
  -- A recipe-level compatible claim is allowed only after reviewing the
  -- complete persisted ingredient set, including optional ingredients.
  ingredient_set_complete boolean not null check (ingredient_set_complete),
  verified_at timestamptz not null,
  source_note text not null,
  primary key (recipe_id, requirement_code)
);

create index if not exists ingredient_compatibility_requirement_idx
  on public.ingredient_compatibility_assessments(requirement_code, ingredient_id);
create index if not exists recipe_compatibility_requirement_idx
  on public.recipe_compatibility_assessments(requirement_code, recipe_id);

alter table public.compatibility_requirements enable row level security;
alter table public.ingredient_compatibility_assessments enable row level security;
alter table public.recipe_compatibility_assessments enable row level security;

drop policy if exists "compatibility requirements read access" on public.compatibility_requirements;
drop policy if exists "ingredient compatibility read access" on public.ingredient_compatibility_assessments;
drop policy if exists "recipe compatibility read access" on public.recipe_compatibility_assessments;
create policy "compatibility requirements read access" on public.compatibility_requirements for select using (true);
create policy "ingredient compatibility read access" on public.ingredient_compatibility_assessments for select using (true);
create policy "recipe compatibility read access" on public.recipe_compatibility_assessments for select using (true);

-- Reference rows reflect the application's existing preference controls only.
-- They carry no compatibility assertion about a recipe or ingredient.
insert into public.compatibility_requirements (code, kind, display_name) values
  ('vegetarian', 'diet', 'Vegetarian'),
  ('vegan', 'diet', 'Vegan'),
  ('eggetarian', 'diet', 'Eggetarian'),
  ('pescatarian', 'diet', 'Pescatarian'),
  ('jain', 'diet', 'Jain'),
  ('halal', 'diet', 'Halal'),
  ('kosher', 'diet', 'Kosher'),
  ('non-vegetarian', 'diet', 'Non-vegetarian'),
  ('peanuts', 'allergen', 'Peanuts'),
  ('tree-nuts', 'allergen', 'Tree nuts'),
  ('milk-dairy', 'allergen', 'Milk / Dairy'),
  ('eggs', 'allergen', 'Eggs'),
  ('wheat', 'allergen', 'Wheat'),
  ('gluten', 'allergen', 'Gluten'),
  ('soy', 'allergen', 'Soy'),
  ('fish', 'allergen', 'Fish'),
  ('shellfish', 'allergen', 'Shellfish'),
  ('sesame', 'allergen', 'Sesame'),
  ('mustard', 'allergen', 'Mustard'),
  ('celery', 'allergen', 'Celery')
on conflict (code) do update set kind = excluded.kind, display_name = excluded.display_name;
