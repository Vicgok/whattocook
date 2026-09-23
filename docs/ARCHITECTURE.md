# WhatToCook Architecture

## Application Flow

React Native / Expo UI
↓
Application Hooks
↓
TanStack Query
↓
Application Services
↓
Domain Logic
↓
Repositories
↓
Supabase

## UI Layer

Responsible for presentation, navigation and interaction.

Screens should not directly own business rules or database queries.

## Query Layer

TanStack Query owns server state.

Responsibilities include:

- caching
- request lifecycle
- mutation lifecycle
- targeted invalidation
- sharing data across screens

## Service Layer

Coordinates application operations spanning repositories and domain behavior.

Services should avoid UI dependencies.

## Domain Layer

Contains deterministic business rules.

Important examples:

- recipe matching
- compatibility
- ranking
- ingredient calculations

Domain code should remain independently testable.

## Repository Layer

Responsible for persistence.

Repositories translate application operations into Supabase operations.

## Supabase

Supabase provides:

- PostgreSQL
- authentication
- Row Level Security
- catalogue persistence
- user persistence
- recipe persistence

## Core Data Flow

### Pantry

UI
→ pantry query/mutation hook
→ pantry repository
→ Supabase

### Recipe Discovery

User preferences

- Pantry
- Recipe catalogue
  ↓
  Compatibility filter
  ↓
  Pantry match calculation
  ↓
  Missing ingredient calculation
  ↓
  Deterministic ranking
  ↓
  Results

### Dietary Compatibility

Recipe metadata

- Ingredient dietary metadata
- Allergen evidence
- User preferences
  ↓
  Deterministic compatibility engine
  ↓
  COMPATIBLE / INCOMPATIBLE / UNKNOWN

Safety filtering occurs before ranking.
