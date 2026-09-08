import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PantryProvider } from "@/context/PantryContext";
import { AppProvider } from "@/context/AppContext";

export default function RootLayout() {
  return <SafeAreaProvider><AppProvider><PantryProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(tabs)" /><Stack.Screen name="recipes" /><Stack.Screen name="cooking" /><Stack.Screen name="auth" /><Stack.Screen name="account" /></Stack></PantryProvider></AppProvider></SafeAreaProvider>;
}
