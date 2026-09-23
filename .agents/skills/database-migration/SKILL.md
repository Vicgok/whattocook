---
name: database-migration
description: Safely implement or review Supabase/PostgreSQL schema migrations for WhatToCook.
---

# Database Migration Workflow

## Inspect

Read:

- related migrations
- relevant repositories
- generated database types where available
- relevant RLS policies

Determine whether the migration has already been deployed.

Never modify a deployed migration.

## Plan

Identify:

- schema additions
- schema removals
- data migration
- indexes
- constraints
- RLS
- backwards compatibility
- client compatibility

## Safety

Preserve user data where practical.

Avoid unsafe defaults for dietary/allergen metadata.

Do not bypass RLS.

## Implement

Create a new timestamped migration.

Use explicit SQL.

Include comments for non-obvious operations.

## Validate

Run available:

- migration validation
- SQL lint
- type generation
- application tests

## Review

Inspect the complete SQL diff before completion.

Report migration risk explicitly.
