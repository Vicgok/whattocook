import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-url-polyfill/auto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(url && publishableKey);

let client: SupabaseClient | null = null;

/**
 * Returns null in local/UI-only development. This keeps first-run guest UX
 * working until a project is configured, while production requests fail closed.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
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
