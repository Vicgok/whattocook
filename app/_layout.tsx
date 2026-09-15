import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PantryProvider } from "@/context/PantryContext";
import { AppProvider } from "@/context/AppContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { SupabaseSessionProvider } from "@/context/SupabaseSessionContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
