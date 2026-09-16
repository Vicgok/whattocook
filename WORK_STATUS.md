# WhatToCook - Work Status

Last updated: 2026-09-16

This is the shared, version-controlled record of project progress. Update it
whenever a phase changes state, then commit and push it to make the update
available on every device.

## At a glance

| Area | Status | Next milestone |
| --- | --- | --- |
| Product foundation and core recipe experience | Complete | Maintain as features evolve |
| Supabase data layer and local-first persistence | Complete | Validate against the production project |
| Identity and onboarding | In progress | Finish and verify the current working changes |
| Release readiness | Planned | Test, harden, and prepare a first release |

## Completed phases

| Phase | Status | Delivered |
| --- | --- | --- |
| 1 - App foundation | Complete | Expo/React Native structure, navigation, shared UI, and project configuration. |
| 2 - Pantry and preferences | Complete | Ingredient catalog and search, pantry management, preference flows, and ingredient matching. |
| 3 - Recipe experience | Complete | Recipe browsing and detail views, saved recipes, cooking flow, and related UX refinements. |
| 4 - Data backend | Complete | Supabase-backed recipe, ingredient, pantry, cooking, preference, and saved-recipe flows; schema migration and seed data. |
| 4.5 - Local-first data | Complete | Query caching, persistence, cache versioning, request tracing, and repository/service integration. |

## Current phase

### 5 - Identity and onboarding

**Status:** In progress

Completed in the baseline:

- Account and authentication screens
- Session startup/bootstrap handling
- Profile repository and hook
- Onboarding completion tracking and identity cache guards
- Identity/onboarding database migration

Implemented and validated:

- Onboarding now suppresses profile and preference prefetching before completion.
- Startup routing now uses the device onboarding marker as its source of truth,
  avoiding a profile request during the first-route decision.
- Pantry, preferences, and saved-recipe data hydration now wait until the device
  marker confirms onboarding is complete.

Next:

- Review the current changes
- Verify sign-up, sign-in, onboarding completion, app restart, and sign-out flows
- Continue Phase 5 verification and complete any remaining identity/onboarding work

## Future phases

These are proposed milestones, not committed scope. Move items into the active
phase only when they are agreed.

| Phase | Status | Proposed focus |
| --- | --- | --- |
| 6 - Quality and release readiness | Planned | End-to-end testing, error states, accessibility, performance, telemetry, and production configuration. |
| 7 - Product expansion | Planned | Recipe content improvements, smarter recommendations, saved/planned meals, and user-feedback-driven features. |
| 8 - Distribution and operations | Planned | Store builds, release process, monitoring, support workflow, and iterative releases. |

## Update log

| Date | Update |
| --- | --- |
| 2026-09-16 | Created shared status tracker. Phase 5 identity/onboarding work is active. |
| 2026-09-16 | Recorded uncommitted Phase 5 guard changes: defer private-data loading until onboarding completion and route startup from the device marker. |
| 2026-09-16 | Validated the onboarding-data guard changes with type checking and the ingredient/recipe/request-audit test suite. |

## How to use this file

Ask for updates in plain language, for example: "mark phase 5 complete" or
"add testing authentication on Android as in progress." After an update, commit
and push this file with the relevant work so every device receives the same
status after pulling the repository.
