import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-url-polyfill/auto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const hasValidProjectUrl = (() => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname.endsWith(".supabase.co") &&
      parsed.pathname === "/"
    );
  } catch {
    return false;
  }
})();

export const isSupabaseConfigured = Boolean(
  hasValidProjectUrl && publishableKey,
);

const projectRef = (() => {
  if (!url) return null;
  try {
    return new URL(url).hostname.split(".")[0] ?? null;
  } catch {
    return "invalid-url";
  }
})();

if (__DEV__) {
  // This deliberately reports only configuration presence and project ref.
  // Never print the publishable key, tokens, or request headers.
  console.info("[SUPABASE CONFIG]", {
    hasUrl: Boolean(url),
    hasValidProjectUrl,
    hasKey: Boolean(publishableKey),
    projectRef,
    configured: isSupabaseConfigured,
  });
}

let client: SupabaseClient | null = null;

/**
 * Returns null in local/UI-only development. This keeps first-run guest UX
 * working until a project is configured, while production requests fail closed.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    if (__DEV__)
      console.warn(
        "[SUPABASE SKIP] domain=client reason=supabase_not_configured",
      );
    return null;
  }
  if (!client) {
    client = createClient(url!, publishableKey!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
