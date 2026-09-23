# Dietary Compatibility Rules

## Base Diet

Exactly zero or one of:

- vegetarian
- vegan
- eggetarian
- pescatarian

These are mutually exclusive.

## Independent Restrictions

These may be combined with any base diet:

- gluten-free
- dairy-free

## Supported Allergens

- peanuts
- tree nuts
- milk
- eggs
- wheat
- soy
- fish
- crustacean shellfish
- sesame

## Avoided Ingredients

Users may maintain canonical ingredient exclusions.

Recipe compatibility must account for these separately from formal allergens.

## Compatibility Result

The engine returns one of:

### COMPATIBLE

Available deterministic metadata provides sufficient evidence that the recipe
meets the requested restrictions.

### INCOMPATIBLE

Available deterministic metadata demonstrates that the recipe violates one or
more restrictions.

### UNKNOWN

Required metadata or evidence is incomplete.

UNKNOWN must not silently become COMPATIBLE.

## Safety Ordering

The discovery pipeline must evaluate:

1. allergens
2. dietary restrictions
3. avoided ingredients
4. other preference filtering
5. pantry matching
6. ranking

AI-generated metadata may assist preparation/review but cannot bypass deterministic
runtime safety rules.
