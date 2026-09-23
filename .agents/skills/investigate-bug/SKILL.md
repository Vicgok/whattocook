---
name: investigate-bug
description: Investigate and fix a WhatToCook bug by tracing the root cause before modifying code.
---

# Bug Investigation Workflow

Use this workflow when debugging unexpected application behavior.

## Phase 1 — Understand

Restate the observed symptom internally.

Identify:

- affected screen/module
- expected behavior
- actual behavior
- likely state/data boundaries

Do not modify code yet.

## Phase 2 — Trace

Search the repository.

Trace:

UI
→ hook
→ query/service
→ repository
→ domain/database

Inspect relevant:

- state
- effects
- query keys
- auth readiness
- caching
- navigation lifecycle
- mutation invalidation

## Phase 3 — Root Cause

Identify the earliest incorrect assumption or state transition.

Distinguish root cause from downstream symptoms.

## Phase 4 — Fix

Implement the smallest coherent correction.

Avoid:

- arbitrary delays
- unnecessary retries
- forced rerenders
- cache-wide invalidation
- duplicate state
- defensive conditions that conceal the issue

## Phase 5 — Regression

Add/update a focused regression test when practical.

## Phase 6 — Verify

Run focused verification first.

Then run the applicable broader verification.

Review `git diff`.

## Report

Return:

- root cause
- fix
- changed files
- tests/verification
- remaining risk
