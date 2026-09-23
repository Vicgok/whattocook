# WhatToCook Engineering Instructions

## Product

WhatToCook is an Android-first mobile cooking application.

Its primary purpose is to help users decide what to cook based on:

- pantry ingredients
- dietary preferences
- allergens
- avoided ingredients
- nutrition goals
- available cooking context

The application must prioritize reliability, food safety, predictable behavior,
simple UX, and low unnecessary backend traffic.

---

## Technology Stack

Primary stack:

- React Native
- Expo
- TypeScript
- Supabase
- PostgreSQL
- TanStack Query
- React Navigation / Expo Router
- Jest / TypeScript tests

Android is currently the primary platform.

Do not introduce architecture or dependencies for iOS-specific requirements
unless explicitly requested.

---

## Primary Engineering Principle

Understand the existing implementation before modifying it.

For any non-trivial task:

1. inspect the relevant code
2. search for existing implementations
3. trace the current execution/data flow
4. identify the actual root cause or integration point
5. determine the smallest coherent change
6. implement it
7. verify it
8. inspect the final diff

Do not immediately patch the first visible symptom.

---

## Repository Exploration

Before creating any new:

- component
- hook
- service
- repository
- utility
- type
- query key
- schema
- database function
- compatibility rule

search the repository for an existing equivalent.

Prefer extending or refactoring existing architecture over creating parallel
implementations.

Avoid duplicate abstractions.

---

## Architecture

Maintain the following dependency direction where practical:

UI / Screens
↓
Hooks / TanStack Query
↓
Application services
↓
Domain logic
↓
Repositories
↓
Supabase

Responsibilities:

### UI / Screens

Responsible for:

- rendering
- user interaction
- navigation
- loading/error/empty states

UI code should not contain database business logic.

Avoid direct Supabase queries from screens.

### Hooks

Responsible for:

- TanStack Query integration
- cache interaction
- mutations
- application-facing orchestration

Hooks should call services/repositories rather than recreate domain logic.

### Domain

Responsible for:

- deterministic business rules
- recipe matching
- recipe ranking
- dietary compatibility
- calculations
- transformations
- validation

Domain code should preferably consist of pure TypeScript functions.

Domain code must not depend on React or React Native.

### Repositories

Responsible for:

- Supabase queries
- persistence
- mapping database records
- database-facing concerns

Do not duplicate business logic inside repositories.

---

## TypeScript

Maintain strict TypeScript correctness.

Rules:

- avoid `any`
- prefer explicit domain types
- prefer discriminated unions for state/results
- do not silence type errors without understanding them
- do not use unsafe casts merely to make compilation pass
- reuse generated Supabase types where appropriate
- remove obsolete types when replacing implementations

Type errors must be resolved at their source.

---

## React / React Native

Prefer:

- small focused components
- composition
- shared design primitives
- stable callbacks where useful
- derived state instead of duplicated state
- existing design system components

Avoid:

- unnecessary `useEffect`
- state synchronized manually with other state
- duplicated loading state
- arbitrary timers
- forced rerenders
- remounting components as a workaround
- navigation hacks

When encountering lifecycle bugs, trace why the lifecycle occurs.

---

## TanStack Query

Use TanStack Query as the primary server-state layer.

Rules:

- use centralized query keys
- reuse cached data
- avoid duplicate requests
- avoid screen-local duplicate fetching
- invalidate only affected query scopes
- use mutation responses to update cache where appropriate
- do not invalidate the entire application cache after small mutations
- queries requiring authentication must wait until authentication is ready

Before adding a query, search for an existing query that already owns the data.

---

## Supabase Network Efficiency

Treat unnecessary Supabase requests as defects.

When investigating repeated calls:

1. identify the initiating hook
2. identify component mounts/remounts
3. inspect query keys
4. inspect stale time
5. inspect retry behavior
6. inspect mutation invalidation
7. inspect auth readiness
8. inspect duplicate repository calls

Do not solve duplicate requests using arbitrary debounce or delay logic unless
that is genuinely required by the feature.

---

## Authentication

Important application rule:

Onboarding must remain separate from authenticated application initialization.

Do not create an anonymous Supabase session merely because the onboarding screen
was opened.

Anonymous session initialization should only happen when required by the
post-onboarding application flow.

User-scoped queries must not execute before authentication readiness.

Do not create multiple simultaneous auth bootstrap requests.

Auth bootstrap should remain single-flight/idempotent.

---

## Onboarding

Onboarding:

- must work without authenticated user data
- must not trigger user-scoped Supabase queries prematurely
- must not create anonymous users unnecessarily
- must persist completion reliably
- must transition cleanly into application initialization

Changes to onboarding must be checked for auth side effects.

---

## Dietary Architecture

Dietary compatibility is safety-sensitive deterministic application logic.

Current supported base diets:

- vegetarian
- vegan
- eggetarian
- pescatarian

Base diets are mutually exclusive.

Independent restrictions:

- gluten-free
- dairy-free

Supported allergens:

- peanuts
- tree nuts
- milk
- eggs
- wheat
- soy
- fish
- crustacean shellfish
- sesame

Canonical avoided ingredients are also supported.

Nutrition goals include:

- high-protein
- lower-calorie
- balanced

Before changing dietary logic, read:

`docs/DIETARY_COMPATIBILITY.md`

---

## Dietary Safety Rule

Compatibility outcomes are:

- COMPATIBLE
- INCOMPATIBLE
- UNKNOWN

Never silently convert UNKNOWN into COMPATIBLE.

AI-generated metadata must not override deterministic allergen or dietary rules.

Missing evidence must fail safely.

Do not weaken these guarantees for improved recipe discovery.

---

## Recipe Discovery

Recipe discovery must preserve deterministic compatibility filtering.

General order:

1. safety / dietary compatibility
2. pantry matching
3. ranking
4. presentation

The ranking system should remain deterministic unless a feature explicitly
introduces another ranking layer.

Avoid putting AI-generated ranking ahead of mandatory safety filtering.

---

## Database

All database schema changes must use migrations.

Never edit a migration that has already been deployed remotely.

Create a new migration instead.

Before changing schema:

1. inspect existing schema
2. inspect related migrations
3. inspect repository usages
4. inspect RLS policies
5. inspect compatibility requirements
6. inspect existing data assumptions

Database migrations should preserve existing data whenever practical.

---

## Row Level Security

RLS must remain enabled for user-owned data.

Never bypass RLS from client application code.

Do not expose Supabase service-role credentials to the React Native application.

Public/catalogue read policies may be used where intentionally designed.

---

## Database Naming

Follow existing database naming conventions.

Prefer:

- snake_case database names
- explicit foreign keys
- appropriate uniqueness constraints
- indexes for frequently queried relationships
- normalized relations when data integrity matters

Do not add JSON columns merely to avoid proper relational modeling unless there
is a justified reason.

---

## Migrations

Migration requirements:

- do not modify deployed migrations
- consider existing rows
- avoid destructive changes unless explicitly required
- add indexes when new query patterns require them
- maintain RLS
- document unusual migration decisions in SQL comments

Run the relevant Supabase validation after changes.

---

## Design System

Use the existing WhatToCook visual system.

Brand qualities:

- fresh
- calm
- helpful
- modern
- trustworthy
- food-first

Core colors:

- primary: `#3F6B4F`
- primaryDark: `#294936`
- primarySoft: `#E8F2EA`
- background: `#FAFBF7`
- surface: `#FFFFFF`
- surfaceSoft: `#F3F5F0`
- text: `#172019`
- textSecondary: `#687069`

Prefer existing design tokens.

Do not introduce arbitrary colors when an equivalent design token exists.

---

## UX

Prioritize:

- clear visual hierarchy
- minimal cognitive load
- useful empty states
- responsive interaction
- predictable navigation
- accessible touch areas
- safe-area correctness
- keyboard correctness
- Android behavior

Do not perform large UI redesigns when the requested task concerns application
logic unless required for the implementation.

---

## Error Handling

Do not silently swallow errors.

Application-facing errors should:

- preserve useful debugging context
- expose user-friendly states where appropriate
- avoid leaking sensitive implementation details

Avoid broad `catch` blocks that convert every failure into success.

---

## Logging

Temporary debugging logs must be removed after investigation unless they form
part of an intentional diagnostic system.

Never log:

- access tokens
- refresh tokens
- passwords
- secret keys
- sensitive authentication payloads

Network diagnostic logs should identify source/domain where useful.

---

## Dependencies

Do not add a new dependency unless:

1. existing dependencies cannot reasonably solve the problem
2. the dependency materially simplifies the implementation
3. maintenance/security implications are acceptable

Explain significant new dependencies in the final implementation report.

---

## Performance

Before introducing memoization, caching, batching, or concurrency, identify the
actual bottleneck.

Important performance concerns for this application include:

- unnecessary Supabase calls
- unnecessary React rerenders
- duplicated recipe queries
- image loading
- expensive recipe matching
- large ingredient catalogue rendering

Prefer measurable improvements over speculative optimization.

---

## Bug Investigation

For bugs use this process:

SYMPTOM
↓
REPRODUCTION
↓
CALL / STATE TRACE
↓
ROOT CAUSE
↓
FIX
↓
REGRESSION TEST
↓
VERIFY

Do not use timing hacks such as arbitrary `setTimeout` calls to conceal race
conditions.

Do not add retries to hide deterministic failures.

Do not force navigation refreshes to hide stale-state problems.

---

## Feature Implementation

For significant features:

1. identify impacted modules
2. identify existing reusable code
3. identify data/schema changes
4. identify compatibility risks
5. implement the smallest complete vertical slice
6. add/update tests
7. run verification
8. review final diff

Avoid speculative framework-building for future requirements.

---

## Tests

Business-critical domain behavior requires tests.

Prioritize tests for:

- dietary compatibility
- allergen behavior
- recipe matching
- ranking
- missing ingredients
- recipe step ordering
- preference serialization
- auth bootstrap behavior
- pantry persistence
- migration-related behavior where practical

A bug fix should include a regression test when practical.

---

## Verification

After changing TypeScript/application code run the available relevant commands.

Preferred:

```bash
npm run typecheck
npm run lint
npm test
```
