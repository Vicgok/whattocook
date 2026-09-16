import { Stack } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PantryProvider } from "@/context/PantryContext";
import { AppProvider } from "@/context/AppContext";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient } from "@/lib/query-client";
import { SupabaseSessionProvider } from "@/context/SupabaseSessionContext";
import { IdentityCacheGuard } from "@/components/identity-cache-guard";
import { AppEntryGuard } from "@/components/app-entry-guard";
import {
  QUERY_CACHE_SCHEMA_VERSION,
  queryPersister,
  removeLegacyCanonicalQueries,
  shouldPersistQuery,
  traceHydratedQueries,
} from "@/lib/query-persistence";

if (__DEV__) console.info("[BOOT] JS initialized");
if (__DEV__) console.info("[BOOT] Cache hydration started");
// AppEntryGuard is the only splash owner and hides it after navigation readiness.
void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  useEffect(() => { if (__DEV__) console.info("[BOOT] RootLayout mounted"); }, []);
  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: queryPersister,
          buster: `schema-${QUERY_CACHE_SCHEMA_VERSION}`,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery },
        }}
        onSuccess={() => {
          if (__DEV__) console.info("[BOOT] Cache hydration completed");
          removeLegacyCanonicalQueries(queryClient);
          traceHydratedQueries(queryClient);
        }}
        onError={() => { if (__DEV__) console.warn("[BOOT] Cache hydration failed; continuing without persisted query data"); }}
      >
        <SupabaseSessionProvider>
          <IdentityCacheGuard>
            <AppProvider>
              <PantryProvider>
                <AppEntryGuard>
                  {(initialRoute) => (
                    <>
                      <StatusBar style="dark" />
                      <Stack
                        initialRouteName={initialRoute}
                        screenOptions={{ headerShown: false }}
                      >
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="recipes" />
                        <Stack.Screen name="cooking" />
                        <Stack.Screen name="auth" />
                        <Stack.Screen name="account" />
                        <Stack.Screen name="onboarding" />
                      </Stack>
                    </>
                  )}
                </AppEntryGuard>
              </PantryProvider>
            </AppProvider>
          </IdentityCacheGuard>
        </SupabaseSessionProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
