import { createContext, ReactNode, useContext } from "react";
import { PantryItem } from "@/domain/ingredients/ingredient.types";
import { useRemotePantry } from "@/hooks/usePantry";
import { useSupabaseSession } from "@/context/SupabaseSessionContext";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useDeviceOnboardingCompletion } from "@/lib/onboarding-completion";

type PantryContextValue = {
  pantry: PantryItem[];
  addIngredients: (ingredientIds: string[]) => Promise<void>;
  removeIngredient: (ingredientId: string) => Promise<void>;
};
const PantryContext = createContext<PantryContextValue | undefined>(undefined);
export function PantryProvider({ children }: { children: ReactNode }) {
  const { userId, isReady } = useSupabaseSession();
  const onboarding = useDeviceOnboardingCompletion(userId ?? undefined);
  const dataReady = Boolean(
    isReady && onboarding.ready && onboarding.completed,
  );
  const remote = useRemotePantry(userId ?? undefined, dataReady);
  const remotePantry = remote.data;
  const usePersistedPantry = Boolean(
    isSupabaseConfigured && userId && dataReady,
  );
  const requirePersistence = () => {
    if (!usePersistedPantry)
      throw new Error("Connect to Supabase and complete onboarding before changing your pantry.");
  };
  const addIngredients = async (ingredientIds: string[]) => {
    requirePersistence();
    await remote.addIngredients.mutateAsync(ingredientIds);
  };
  const removeIngredient = async (ingredientId: string) => {
    requirePersistence();
    await remote.removeIngredient.mutateAsync(ingredientId);
  };
  return (
    <PantryContext.Provider
      value={{
        pantry: usePersistedPantry ? (remotePantry ?? []) : [],
        addIngredients,
        removeIngredient,
      }}
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
