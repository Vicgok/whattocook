---
name: implement-feature
description: Implement a complete WhatToCook feature while preserving current architecture and avoiding unnecessary scope.
---

# Feature Implementation Workflow

## Discover

Search for existing:

- related screens
- hooks
- services
- repositories
- domain modules
- query keys
- types
- database schema
- tests

## Design

Determine the minimum complete vertical slice.

Identify:

- UI changes
- application logic
- domain logic
- persistence changes
- database migration needs
- tests

Do not create speculative abstractions.

## Implement

Maintain:

UI
→ hooks
→ services/domain
→ repositories
→ Supabase

Reuse existing abstractions.

## Test

Add tests for new business rules.

Update related existing tests where behavior intentionally changes.

## Verify

Run focused tests.

Run applicable project verification.

Inspect final diff.

## Report

Provide:

- approach
- files changed
- architectural decisions
- verification
- follow-up items
