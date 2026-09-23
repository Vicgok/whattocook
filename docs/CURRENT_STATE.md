# WhatToCook Current Development State

Last reviewed: 2026-09

## Current Focus

Stabilize the core application vertical slice and data persistence before major
additional UX refinement.

## Implemented

- React Native / Expo application
- Supabase integration
- TanStack Query integration
- canonical ingredient catalogue
- pantry persistence
- anonymous session bootstrap
- recipe repository/query flow
- deterministic recipe ranking
- recipe detail flow
- cooking step flow
- normalized dietary preference architecture
- normalized allergen architecture
- deterministic recipe compatibility engine
- onboarding dietary preferences
- profile preference editing

## Dietary Architecture

Implemented V1:

- vegetarian
- vegan
- eggetarian
- pescatarian
- gluten-free
- dairy-free
- nine supported allergen categories
- canonical avoided ingredients
- nutrition goals
- compatibility result states

Migration:

`supabase/migrations/202609200001_locked_v1_dietary_architecture.sql`

## Current Priorities

1. stabilize core data flow
2. complete cooking experience
3. complete user persistence
4. implement recipe/ingredient imagery
5. add AI where it provides meaningful user value

## Engineering Concerns

Continue watching for:

- duplicate Supabase requests
- premature authentication initialization
- unnecessary refetching
- duplicated cached recipe data
- UI logic leaking into domain behavior
- incomplete dietary metadata becoming incorrectly compatible

## Documentation Rule

Update this file when a meaningful architecture milestone is completed.

Do not update it for tiny bug fixes.
