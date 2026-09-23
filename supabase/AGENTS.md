# WhatToCook Supabase Instructions

These rules apply to the `supabase/` subtree.

## Migration Policy

Never modify a migration already deployed remotely.

Always create a new migration.

Before creating a migration:

1. inspect related migrations
2. inspect current schema assumptions
3. search application code for affected columns/tables
4. inspect RLS policies
5. identify data migration requirements
6. consider backwards compatibility

## Data Safety

Avoid destructive schema operations unless explicitly required.

For potentially destructive changes:

- preserve existing data
- migrate before dropping
- validate assumptions
- explain risk

## RLS

User-owned tables require appropriate Row Level Security.

Do not weaken an RLS policy merely to make an application query work.

Fix the ownership/query architecture instead.

Catalogue tables may expose intentional read policies.

## Credentials

Never expose:

- service-role key
- privileged database password
- secrets

The React Native client must not use privileged database credentials.

## Schema Design

Prefer:

- relational integrity
- foreign keys
- unique constraints where logically required
- indexes for common access paths
- normalized safety-critical metadata

Avoid using JSON as a substitute for important relational constraints.

## Dietary Metadata

Dietary/allergen metadata is safety-sensitive.

Schema changes affecting compatibility must preserve the application's ability
to distinguish:

- compatible
- incompatible
- unknown/incomplete evidence

Do not introduce defaults that convert missing safety evidence into safe.

## Validation

After database changes run available Supabase migration/lint/type-generation
checks.

Review SQL manually before reporting completion.
