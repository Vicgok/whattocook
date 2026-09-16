# WhatToCook - Work Status

Last updated: 2026-09-17

This is the shared, version-controlled record of project progress. Update it
whenever a phase changes state, then commit and push it to make the update
available on every device.

## At a glance

| Area                                            | Status      | Next milestone                                |
| ----------------------------------------------- | ----------- | --------------------------------------------- |
| Product foundation and core recipe experience   | Complete    | Maintain as features evolve                   |
| Supabase data layer and local-first persistence | Complete    | Validate against the production project       |
| Identity and onboarding                         | Complete    | Maintain authentication and onboarding flows  |
| Navigation experience                           | Complete    | Maintain and refine as the app evolves        |
| Release readiness                               | In progress | Test, harden, and prepare a first release     |

## Completed phases

| Phase                      | Status   | Delivered                                                                                                                |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1 - App foundation         | Complete | Expo/React Native structure, navigation, shared UI, and project configuration.                                           |
| 2 - Pantry and preferences | Complete | Ingredient catalog and search, pantry management, preference flows, and ingredient matching.                             |
| 3 - Recipe experience      | Complete | Recipe browsing and detail views, saved recipes, cooking flow, and related UX refinements.                               |
| 4 - Data backend           | Complete | Supabase-backed recipe, ingredient, pantry, cooking, preference, and saved-recipe flows; schema migration and seed data. |
| 4.5 - Local-first data     | Complete | Query caching, persistence, cache versioning, request tracing, and repository/service integration.                       |
| 5 - Identity and onboarding | Complete | Authentication and session lifecycle, onboarding experience and completion guards, profile flow, and private-data hydration gating. |
| 5.5 - Navigation refinement | Complete | Compact animated bottom navigation and safe tab-content insets across the primary app tabs. |

## Current phase

### 6 - Quality and release readiness

**Status:** In progress

Phase 5 identity/onboarding work and the bottom-navigation refinement are merged
to `main`. The current focus is P1 — stabilize core data flow.

Completed P1 implementation awaiting environment verification:

- Removed mock pantry defaults and mock recipe fallback from production paths.
- Gated pantry reads on the verified current identity; retained rollback-safe
  mutation cache updates and visible write failures.
- Added conservative dietary compatibility schema/engine and filtering before
  deterministic recipe ranking; unverified data remains `UNKNOWN`.
- Added migration `202609170001_dietary_compatibility.sql`, compatibility tests,
  and a canonical cache-version bump.

Next:

- Apply and lint the pending migration against a running local Supabase stack.
- Complete sourced manual review for ingredient and complete-recipe dietary/
  allergen assessments; current coverage is 0/341 verified ingredients and
  0/3 verified recipes.
- Perform Android/iOS end-to-end authentication, onboarding, pantry,
  preferences, recipe-discovery, offline, and account-switching verification.

## MVP completion roadmap

| Priority | Status | Focus | Completion gate |
| -------- | ------ | ----- | --------------- |
| P1 — Stabilize core data flow | In progress | Audit data sources, remove hardcoded production data, resolve authentication-readiness issues, and eliminate redundant API calls. | Correct, consistent data with no unnecessary requests. |
| P2 — Complete cooking experience | Planned — Critical | Implement and test the full journey from pantry selection through cooking completion, including interruption recovery. | Full cooking journey works reliably. |
| P3 — Complete user persistence | Planned — High | Persist pantry, dietary preferences, bookmarks, and guest data; implement safe guest-to-account migration. | No unintended data loss after restart or account upgrade. |
| P4 — Integrate real imagery | Planned — High | Add ingredient and recipe image storage, caching, loading placeholders, and fallbacks. | Images load efficiently; missing images never block functionality. |
| P5 — Introduce AI | Planned — After core stability | Build a secure natural-language meal-request feature while retaining deterministic matching and dietary validation. | AI improves discovery without bypassing safety or increasing costs unnecessarily. |

## Future phases

These are proposed milestones, not committed scope. Move items into the active
phase only when they are agreed.

| Phase                             | Status  | Proposed focus                                                                                                |
| --------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| 6 - Quality and release readiness | Planned | End-to-end testing, error states, accessibility, performance, telemetry, and production configuration.        |
| 7 - Product expansion             | Planned | Recipe content improvements, smarter recommendations, saved/planned meals, and user-feedback-driven features. |
| 8 - Distribution and operations   | Planned | Store builds, release process, monitoring, support workflow, and iterative releases.                          |

## Update log

| Date       | Update                                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-16 | Created shared status tracker. Phase 5 identity/onboarding work is active.                                                                   |
| 2026-09-16 | Recorded uncommitted Phase 5 guard changes: defer private-data loading until onboarding completion and route startup from the device marker. |
| 2026-09-16 | Validated the onboarding-data guard changes with type checking and the ingredient/recipe/request-audit test suite.                           |
| 2026-09-17 | Marked Phase 5 complete after the merged identity/onboarding lifecycle refinement; advanced Phase 6 release readiness to active.             |
| 2026-09-17 | Recorded the merged compact bottom-navigation refinement as completed Phase 5.5 work.                                                         |
| 2026-09-17 | Added the five-priority MVP completion roadmap; P1 data-flow stabilization is now the active focus.                                            |
| 2026-09-17 | Stabilized production data paths, identity-gated pantry reads, and query-backed recipe states; type checking and the expanded test suite pass. |
| 2026-09-17 | Added conservative dietary compatibility schema/engine and discovery filtering. Coverage is 0/341 verified ingredients and 0/3 verified recipes pending sourced review. |

## How to use this file

Ask for updates in plain language, for example: "mark phase 5 complete" or
"add testing authentication on Android as in progress." After an update, commit
and push this file with the relevant work so every device receives the same
status after pulling the repository.
