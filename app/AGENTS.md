# WhatToCook Application/UI Instructions

These rules apply to the `app/` subtree.

## Responsibilities

Screens should primarily handle:

- rendering
- user interaction
- navigation
- screen composition
- loading/error/empty UI

Do not put database or complex domain logic directly in screens.

## Data

Use existing TanStack Query hooks.

Before adding fetching logic search for existing:

- query hooks
- repository functions
- query keys
- cached entities

Avoid duplicate requests.

## Authentication

Screens must respect authentication readiness.

Onboarding must not trigger anonymous user creation merely by rendering.

Do not work around auth races with arbitrary timers.

## Navigation

Preserve existing navigation architecture.

Do not reset entire navigation state to work around stale component state.

Fix state ownership at its source.

## UX

Follow existing WhatToCook design tokens and interaction patterns.

Prioritize Android behavior.

Always account for:

- safe areas
- keyboard
- loading
- errors
- empty state
- touch target size
- scrolling

## UI Scope

When implementing backend/business logic tasks, avoid unrelated UI redesigns.

When implementing UI refinement, preserve existing business behavior unless the
requested design requires an intentional change.
