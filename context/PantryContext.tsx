import { createContext, ReactNode, useContext, useState } from "react";
import { defaultPantry } from "@/data/mockIngredients";

type PantryContextValue = { pantry: string[]; addIngredients: (items: string[]) => void; removeIngredient: (item: string) => void };
const PantryContext = createContext<PantryContextValue | undefined>(undefined);
export function PantryProvider({ children }: { children: ReactNode }) {
  const [pantry, setPantry] = useState(defaultPantry);
  const addIngredients = (items: string[]) => setPantry((old) => Array.from(new Set([...old, ...items])));
  const removeIngredient = (item: string) => setPantry((old) => old.filter((name) => name !== item));
  return <PantryContext.Provider value={{ pantry, addIngredients, removeIngredient }}>{children}</PantryContext.Provider>;
}
export const usePantry = () => {
  const value = useContext(PantryContext);
  if (!value) throw new Error("usePantry must be used inside PantryProvider");
  return value;
};
