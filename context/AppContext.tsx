import { createContext, ReactNode, useContext, useState } from "react";

export type UserPreferences = {
  dietPreferences: string[];
  nutritionGoals: string[];
  allergies: string[];
  avoidedIngredients: AvoidedIngredient[];
  units: "Metric" | "Imperial";
  notificationsEnabled: boolean;
  appearance: string;
};
export type AvoidedIngredient =
  | { type: "canonical"; ingredientId: string }
  | { type: "custom"; value: string };

type AppContextValue = {
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  savedRecipeIds: string[];
  preferences: UserPreferences;
  pendingSaveId: string | null;
  signIn: (name?: string, email?: string) => void;
  signOut: () => void;
  toggleSaved: (id: string) => void;
  setPendingSaveId: (id: string | null) => void;
  updatePreferences: (changes: Partial<UserPreferences>) => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);
const initialPreferences: UserPreferences = {
  dietPreferences: ["No preference"],
  nutritionGoals: ["High protein"],
  allergies: [],
  avoidedIngredients: [],
  units: "Metric",
  notificationsEnabled: true,
  appearance: "System default",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AppContextValue["user"]>(null);
  const [savedRecipeIds, setSavedRecipeIds] = useState([
    "chicken-egg-rice-bowl",
    "spicy-chicken-fried-rice",
    "quick-egg-chicken-bowl",
  ]);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [pendingSaveId, setPendingSaveId] = useState<string | null>(null);
  const signIn = (name = "Vignesh", email = "vignesh@example.com") => {
    setIsAuthenticated(true);
    setUser({ name, email });
  };
  const signOut = () => {
    setIsAuthenticated(false);
    setUser(null);
    setPendingSaveId(null);
  };
  const toggleSaved = (id: string) =>
    setSavedRecipeIds((old) =>
      old.includes(id) ? old.filter((saved) => saved !== id) : [...old, id],
    );
  const updatePreferences = (changes: Partial<UserPreferences>) =>
    setPreferences((old) => ({ ...old, ...changes }));
  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        user,
        savedRecipeIds,
        preferences,
        pendingSaveId,
        signIn,
        signOut,
        toggleSaved,
        setPendingSaveId,
        updatePreferences,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}
