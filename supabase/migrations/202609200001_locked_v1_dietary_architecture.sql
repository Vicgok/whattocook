-- Locked V1 dietary architecture. This is additive: legacy JSON preferences and
-- existing compatibility assessments are retained for backwards compatibility.
create table if not exists public.allergen_categories (
  code text primary key check (code in ('peanuts','tree-nuts','milk','eggs','wheat','soy','fish','crustacean-shellfish','sesame')),
  display_name text not null unique
);
insert into public.allergen_categories(code, display_name) values
 ('peanuts','Peanuts'),('tree-nuts','Tree nuts'),('milk','Milk'),('eggs','Eggs'),('wheat','Wheat'),('soy','Soy'),('fish','Fish'),('crustacean-shellfish','Crustacean shellfish'),('sesame','Sesame')
on conflict (code) do nothing;

create table if not exists public.ingredient_dietary_metadata (
 ingredient_id text primary key references public.ingredients(id) on delete cascade,
 contains_meat boolean, contains_poultry boolean, contains_fish boolean, contains_shellfish boolean,
 contains_egg boolean, contains_dairy boolean, contains_honey boolean, contains_gluten boolean,
 ingredient_composition_complete boolean not null default false,
 verification_status text not null default 'unknown' check (verification_status in ('unknown','proposed','verified')),
 provenance text, verified_at timestamptz, reviewed_at timestamptz,
 check ((verification_status <> 'verified') or verified_at is not null)
);
create table if not exists public.ingredient_allergen_metadata (
 ingredient_id text not null references public.ingredients(id) on delete cascade,
 allergen_code text not null references public.allergen_categories(code) on delete restrict,
 status text not null check (status in ('present','not_present','unknown')),
 verification_status text not null default 'unknown' check (verification_status in ('unknown','proposed','verified')),
 provenance text, verified_at timestamptz,
 primary key (ingredient_id, allergen_code),
 check ((verification_status <> 'verified') or verified_at is not null),
 check ((status <> 'not_present') or verification_status = 'verified')
);
create table if not exists public.recipe_dietary_metadata (
 recipe_id text primary key references public.recipes(id) on delete cascade,
 ingredient_list_complete boolean not null default false,
 verification_status text not null default 'unknown' check (verification_status in ('unknown','proposed','verified')),
 provenance text, verified_at timestamptz, reviewed_at timestamptz,
 check ((verification_status <> 'verified') or verified_at is not null)
);
create table if not exists public.dietary_metadata_proposals (
 id uuid primary key default gen_random_uuid(), entity_type text not null check (entity_type in ('ingredient','recipe')),
 entity_id text not null, proposal jsonb not null, model_identifier text not null, prompt_version text not null,
 processing_status text not null default 'pending_review' check (processing_status in ('pending_review','approved','rejected','failed')),
 ambiguity_notes text, token_usage jsonb, created_at timestamptz not null default now(), reviewed_at timestamptz, reviewed_by uuid references auth.users(id),
 unique(entity_type, entity_id, model_identifier, prompt_version)
);
create table if not exists public.dietary_metadata_runs (
 id uuid primary key default gen_random_uuid(), run_key text not null unique, dry_run boolean not null default true,
 processed_count integer not null default 0, success_count integer not null default 0, failure_count integer not null default 0, retry_count integer not null default 0,
 token_usage jsonb, created_at timestamptz not null default now(), completed_at timestamptz
);

alter table public.user_preferences add column if not exists base_diet text check (base_diet in ('vegetarian','vegan','eggetarian','pescatarian'));
alter table public.user_preferences add column if not exists gluten_free boolean not null default false;
alter table public.user_preferences add column if not exists dairy_free boolean not null default false;
alter table public.user_preferences add column if not exists nutrition_goal text check (nutrition_goal in ('high-protein','lower-calorie','balanced'));
create table if not exists public.user_preference_allergens (
 user_id uuid not null references auth.users(id) on delete cascade, allergen_code text not null references public.allergen_categories(code) on delete restrict,
 primary key(user_id, allergen_code)
);
create table if not exists public.user_avoided_ingredients (
 user_id uuid not null references auth.users(id) on delete cascade, ingredient_id text not null references public.ingredients(id) on delete restrict,
 primary key(user_id, ingredient_id)
);

-- Safe deterministic backfill only. Non-V1 values stay in legacy JSON, visibly unmapped.
update public.user_preferences set base_diet = case lower(coalesce(diet->>0,''))
 when 'vegetarian' then 'vegetarian' when 'vegan' then 'vegan' when 'eggetarian' then 'eggetarian' when 'pescatarian' then 'pescatarian' else base_diet end
where base_diet is null;

create index if not exists ingredient_allergen_metadata_allergen_idx on public.ingredient_allergen_metadata(allergen_code, ingredient_id);
create index if not exists dietary_metadata_proposals_review_idx on public.dietary_metadata_proposals(processing_status, entity_type);
alter table public.allergen_categories enable row level security;
alter table public.ingredient_dietary_metadata enable row level security;
alter table public.ingredient_allergen_metadata enable row level security;
alter table public.recipe_dietary_metadata enable row level security;
alter table public.dietary_metadata_proposals enable row level security;
alter table public.dietary_metadata_runs enable row level security;
alter table public.user_preference_allergens enable row level security;
alter table public.user_avoided_ingredients enable row level security;
create policy "allergen catalogue read access" on public.allergen_categories for select using (true);
create policy "ingredient dietary metadata read access" on public.ingredient_dietary_metadata for select using (true);
create policy "ingredient allergen metadata read access" on public.ingredient_allergen_metadata for select using (true);
create policy "recipe dietary metadata read access" on public.recipe_dietary_metadata for select using (true);
create policy "preference allergens private" on public.user_preference_allergens for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "avoided ingredients private" on public.user_avoided_ingredients for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- Proposals and runs intentionally have no client policies: server-side review tooling only.
