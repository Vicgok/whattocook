import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PantryProvider } from "@/context/PantryContext";
import { AppProvider } from "@/context/AppContext";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient } from "@/lib/query-client";
import { SupabaseSessionProvider } from "@/context/SupabaseSessionContext";
import { QUERY_CACHE_SCHEMA_VERSION, queryPersister, removeLegacyCanonicalQueries, shouldPersistQuery, traceHydratedQueries } from "@/lib/query-persistence";

export default function RootLayout() {
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
          removeLegacyCanonicalQueries(queryClient);
          traceHydratedQueries(queryClient);
        }}
      >
        <SupabaseSessionProvider>
          <AppProvider>
            <PantryProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="recipes" />
                <Stack.Screen name="cooking" />
                <Stack.Screen name="auth" />
                <Stack.Screen name="account" />
              </Stack>
            </PantryProvider>
          </AppProvider>
        </SupabaseSessionProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
