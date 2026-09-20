import { createContext, ReactNode, useContext, useState } from "react";
import { isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase";
import * as Linking from "expo-linking";
import { useSavedRecipeIds } from "@/hooks/useSavedRecipes";
import { useUserPreferences } from "@/hooks/usePreferences";
import { useSupabaseSession } from "@/context/SupabaseSessionContext";
import { useDeviceOnboardingCompletion } from "@/lib/onboarding-completion";

export type AvoidedIngredient =
  | { type: "canonical"; ingredientId: string }
  | { type: "custom"; value: string };
export type UserPreferences = {
  dietPreferences: string[];
  baseDiet?: "vegetarian" | "vegan" | "eggetarian" | "pescatarian" | null;
  glutenFree?: boolean;
  dairyFree?: boolean;
  nutritionGoals: string[];
  allergies: string[];
  avoidedIngredients: AvoidedIngredient[];
  units: "Metric" | "Imperial";
  notificationsEnabled: boolean;
  appearance: string;
};
const initialPreferences: UserPreferences = {
  // An absent database row is not a saved dietary choice. UI controls may
  // present “No preference”, but queries must not manufacture it as data.
  dietPreferences: [],
  baseDiet: null,
  glutenFree: false,
  dairyFree: false,
  nutritionGoals: [],
  allergies: [],
  avoidedIngredients: [],
  units: "Metric",
  notificationsEnabled: true,
  appearance: "System default",
};
type AppContextValue = {
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  savedRecipeIds: string[];
  preferences: UserPreferences;
  preferencesStatus: "loading" | "saved" | "empty" | "error" | "unavailable";
  pendingSaveId: string | null;
  sendMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  toggleSaved: (id: string) => void;
  setPendingSaveId: (id: string | null) => void;
  updatePreferences: (changes: Partial<UserPreferences>) => Promise<void>;
};
const AppContext = createContext<AppContextValue | undefined>(undefined);
export function AppProvider({ children }: { children: ReactNode }) {
  const {
    user: authUser,
    userId,
    isReady,
    isSignedIn,
    signOut: supabaseSignOut,
  } = useSupabaseSession();
  const onboarding = useDeviceOnboardingCompletion(userId ?? undefined);
  const [pendingSaveId, setPendingSaveId] = useState<string | null>(null);
  const dataReady = Boolean(
    isReady && onboarding.ready && onboarding.completed,
  );
  const saved = useSavedRecipeIds(userId ?? undefined, dataReady);
  const remotePreferences = useUserPreferences(userId ?? undefined, dataReady);
  const remote = Boolean(isSupabaseConfigured && dataReady && userId);
  const preferencesStatus = !remote
    ? "unavailable"
    : remotePreferences.isPending
      ? "loading"
      : remotePreferences.isError
        ? "error"
        : remotePreferences.data
          ? "saved"
          : "empty";
  const preferences = remote
    ? (remotePreferences.data ?? initialPreferences)
    : initialPreferences;
  const sendMagicLink = async (email: string) => {
    const client = getSupabaseClient();
    if (!client) throw new Error("Supabase is not configured.");
    const { error } = await client.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: Linking.createURL("auth/email-complete") },
    });
    if (error) throw error;
  };
  return (
    <AppContext.Provider
      value={{
        isAuthenticated: isSignedIn,
        user:
          isSignedIn && authUser
            ? {
                name: String(
                  authUser.user_metadata.display_name ??
                    authUser.email ??
                    "Member",
                ),
                email: authUser.email ?? "",
              }
            : null,
        savedRecipeIds: remote ? (saved.data ?? []) : [],
        preferences,
        preferencesStatus,
        pendingSaveId,
        sendMagicLink,
        signOut: async () => {
          setPendingSaveId(null);
          await supabaseSignOut();
        },
        toggleSaved: (id) => {
          if (remote)
            (saved.data ?? []).includes(id)
              ? saved.unsave.mutate(id)
              : saved.save.mutate(id);
        },
        setPendingSaveId,
        updatePreferences: async (changes) => {
          if (!remote) throw new Error("Preferences are unavailable until authentication is ready.");
          await remotePreferences.update.mutateAsync({ ...preferences, ...changes });
        },
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
