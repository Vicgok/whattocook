# WhatToCook

WhatToCook is an Expo and React Native app for turning the ingredients in your pantry into recipe ideas. It includes pantry management, ingredient matching, recipe browsing, saved recipes, cooking views, and account flows.

## Prerequisites

- Node.js 20 or later
- npm
- Expo Go on a device, or an Android/iOS simulator

## Get started

```bash
npm install
npm start
```

Use the Expo development tools to open the app on your preferred device or simulator.

## Checks

```bash
npm run typecheck
npm run test:ingredients
```

## Stack

- Expo Router
- React Native and React
- TypeScript

## Project layout

- `app/` — screens and navigation routes
- `components/` — shared UI and recipe components
- `context/` — application and pantry state
- `domain/ingredients/` — ingredient matching and validation logic
- `data/` — mock recipes, ingredients, and categories
- `tests/` — domain tests
