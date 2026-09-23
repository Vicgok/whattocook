---
name: verify-merge
description: Audit a merge or conflict resolution to confirm intended implementations survived without regressions.
---

# Merge Verification Workflow

## Inspect

Run:

git status --short
git diff

Inspect recent relevant history where necessary.

Search for conflict markers.

## Identify Expected Behavior

Determine the intended implementations from:

- current architecture
- relevant files
- tests
- migrations
- user-specified requirements

## Audit

For each expected implementation classify it:

PRESENT
PARTIAL
MISSING
REGRESSION

Do not assume compiling means merge correctness.

Inspect:

- imports
- exports
- call sites
- types
- query behavior
- database mapping
- tests
- serialization
- compatibility logic

## Verify

Run focused affected tests.

Run applicable project-wide verification.

## Report

Return sections:

A. MERGE STATUS

B. VERIFIED IMPLEMENTATION

C. PARTIAL / MISSING IMPLEMENTATION

D. REGRESSIONS

E. VERIFICATION

F. REQUIRED FIXES

Do not modify code unless the user requested fixes in addition to the audit.
