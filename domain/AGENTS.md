# WhatToCook Domain Layer

These rules apply to the `domain/` subtree.

## Purpose

Domain code contains deterministic application business logic.

Examples:

- recipe compatibility
- recipe matching
- recipe ranking
- ingredient calculations
- dietary rules
- nutrition rules
- transformations
- validation

## Rules

Prefer pure functions.

Do not import:

- React
- React Native
- navigation
- Supabase clients
- UI components

Do not perform network requests.

Domain functions should accept explicit inputs and return explicit results.

Business rules require unit tests.

Avoid hidden global state.

## Dietary Safety

Dietary and allergen compatibility is safety-sensitive.

Possible compatibility outcomes:

- COMPATIBLE
- INCOMPATIBLE
- UNKNOWN

Missing evidence must never silently become COMPATIBLE.

Allergen restrictions take precedence over recipe ranking.

AI output cannot override deterministic safety rules.

Before changing dietary logic read:

`docs/DIETARY_COMPATIBILITY.md`

## Recipe Ranking

Ranking must remain deterministic unless explicitly requested otherwise.

Do not mix compatibility filtering and ranking into one opaque function.

Prefer:

compatibility filter
→ match calculation
→ missing ingredient calculation
→ ranking

## Testing

Any modification to domain behavior should add or update focused unit tests.

Test:

- expected behavior
- boundary cases
- missing data
- UNKNOWN states
- conflicting preferences
