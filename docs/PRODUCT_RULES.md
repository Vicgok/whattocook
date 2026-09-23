# WhatToCook Product Rules

## Product Principle

WhatToCook should reduce the effort required to decide what to cook.

The application should be faster and more structured than manually describing
the user's pantry and preferences to a general chatbot.

## Core Experience

Target flow:

Pantry
→ Discover recipes
→ Results
→ Recipe detail
→ Start cooking
→ Cooking steps
→ Complete

This vertical slice takes priority over secondary functionality.

## Pantry

Pantry data should represent canonical ingredients.

Avoid hardcoded application pantry data outside fixtures, previews or explicit
offline bootstrap data.

## Recipe Discovery

Safety rules are deterministic.

Ranking should remain explainable and predictable.

## Persistence

Important user state should survive application restart where appropriate:

- pantry
- preferences
- bookmarks
- cooking progress

## Guest Experience

The product supports a guest/anonymous path.

Onboarding itself should not create backend identity unnecessarily.

Backend identity should initialize only when application functionality requiring
persistence is entered.

## AI

AI should be used where it provides genuine user value.

AI must not replace deterministic:

- allergen filtering
- dietary safety
- authorization
- data integrity
