# WhatToCook Testing Instructions

Tests should validate behavior rather than implementation details.

Prefer deterministic unit tests for domain logic.

## Priorities

Highest-priority coverage:

- dietary compatibility
- allergens
- avoided ingredients
- recipe matching
- recipe ranking
- pantry calculations
- preference serialization
- auth bootstrap
- recipe step ordering
- mutation/cache behavior where practical

## Bug Fixes

When fixing a bug:

1. reproduce or identify the failing case
2. add/update a regression test when practical
3. implement the fix
4. confirm the regression test passes
5. run relevant wider verification

## Test Quality

Avoid tests that only prove a mock was called.

Prefer assertions on externally observable behavior.

Keep fixtures small and explicit.

Do not weaken existing assertions simply to make changed behavior pass unless the
product behavior intentionally changed.
