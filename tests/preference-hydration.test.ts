import { hydratePreferences } from "../domain/preferences/preference-hydration";

const expect = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const legacyRow = {
  diet: ["Vegan"],
  allergies: ["Milk", "Personal restriction"],
  nutrition_goals: ["High protein"],
  cooking_preferences: {
    avoidedIngredients: [
      { type: "canonical" as const, ingredientId: "legacy-milk" },
      { type: "custom" as const, value: "Coriander" },
    ],
    units: "Imperial" as const,
    notificationsEnabled: false,
    appearance: "Dark",
  },
  base_diet: "vegan" as const,
  gluten_free: true,
  dairy_free: true,
};

const hydrated = hydratePreferences(
  legacyRow,
  [{ allergen_code: "milk" }],
  [{ ingredient_id: "milk" }],
);
expect(hydrated.baseDiet === "vegan", "base diet hydrates from the base row");
expect(hydrated.glutenFree && hydrated.dairyFree, "independent restrictions hydrate from the base row");
expect(hydrated.allergies.join() === "Milk,Personal restriction", "normalized allergens retain unmapped legacy values");
expect(hydrated.avoidedIngredients.length === 2, "normalized avoided ingredients retain custom legacy values");
expect(hydrated.avoidedIngredients[0]?.type === "canonical" && hydrated.avoidedIngredients[0].ingredientId === "milk", "canonical avoided ingredients hydrate from the normalized relation");
expect(hydrated.avoidedIngredients[1]?.type === "custom", "custom avoided ingredients remain in legacy storage");

const legacyOnly = hydratePreferences(legacyRow, [], []);
expect(legacyOnly.allergies.join() === legacyRow.allergies.join(), "legacy allergens remain available before normalized rows exist");
expect(legacyOnly.avoidedIngredients.length === 2, "legacy avoided ingredients remain available before normalized rows exist");
