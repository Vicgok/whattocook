import { createContext, ReactNode, useContext, useState } from "react";
import { defaultPantryIngredientIds } from "@/data/mockIngredients";
import { PantryItem } from "@/domain/ingredients/ingredient.types";

type PantryContextValue = {
  pantry: PantryItem[];
  addIngredients: (ingredientIds: string[]) => void;
  removeIngredient: (ingredientId: string) => void;
};
const PantryContext = createContext<PantryContextValue | undefined>(undefined);
const createPantryItem = (ingredientId: string): PantryItem => ({
  id: ingredientId,
  userId: "local-user",
  ingredientId,
  createdAt: "2026-09-07",
  updatedAt: "2026-09-07",
});
export function PantryProvider({ children }: { children: ReactNode }) {
  const [pantry, setPantry] = useState<PantryItem[]>(() =>
    defaultPantryIngredientIds.map(createPantryItem),
  );
  const addIngredients = (ingredientIds: string[]) =>
    setPantry((old) => {
      const existingIds = new Set(old.map((item) => item.ingredientId));
      const newIds = ingredientIds.filter((ingredientId) => {
        if (existingIds.has(ingredientId)) return false;
        existingIds.add(ingredientId);
        return true;
      });
      return [...old, ...newIds.map(createPantryItem)];
    });
  const removeIngredient = (ingredientId: string) =>
    setPantry((old) =>
      old.filter((item) => item.ingredientId !== ingredientId),
    );
  return (
    <PantryContext.Provider
      value={{ pantry, addIngredients, removeIngredient }}
    >
      {children}
    </PantryContext.Provider>
  );
}
export const usePantry = () => {
  const value = useContext(PantryContext);
  if (!value) throw new Error("usePantry must be used inside PantryProvider");
  return value;
};
