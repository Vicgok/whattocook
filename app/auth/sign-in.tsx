import { Linking, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AuthProviderButton, AuthScreen } from "@/components/auth-screen";
import { authConfig } from "@/lib/auth-config";
import { colors, spacing, typography } from "@/theme";

export default function SignIn() {
  const router = useRouter(); const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const continueAsGuest = () => router.replace(returnTo || "/(tabs)/profile");
  // Google/Apple remain deliberately absent until their native OAuth handlers are installed.
  const hasProviders = authConfig.emailMagicLink;
  return <AuthScreen><View style={{ flex: 1, justifyContent: "space-between", gap: spacing.xxl }}>
    <View style={{ alignItems: "center", gap: spacing.md, paddingTop: spacing.xxl }}><Text style={{ fontSize: 24, lineHeight: 30, fontWeight: "700", color: colors.primary }}>WhatToCook</Text><Text style={{ ...typography.display, color: colors.text, textAlign: "center" }}>Less deciding.{"\n"}More cooking.</Text><Text style={{ ...typography.body, color: colors.textSecondary, textAlign: "center", maxWidth: 280 }}>Your kitchen and favorite meals stay with you.</Text></View>
    <View style={{ gap: spacing.md }}>
      {authConfig.emailMagicLink ? <AuthProviderButton label="Continue with Email" onPress={() => router.push({ pathname: "/auth/email", params: returnTo ? { returnTo } : {} })} /> : null}
      {!hasProviders ? <Text style={{ ...typography.metadata, color: colors.textSecondary, textAlign: "center" }}>Account sign-in will be available when a provider is configured.</Text> : null}
      <Pressable onPress={continueAsGuest} accessibilityRole="button" style={({ pressed }) => ({ minHeight: 48, justifyContent: "center", alignItems: "center", opacity: pressed ? 0.7 : 1 })}><Text style={{ ...typography.button, color: colors.primary }}>Continue as Guest</Text></Pressable>
    </View>
    <View style={{ minHeight: 28, justifyContent: "flex-end", flexDirection: "row", gap: spacing.sm }}>
      {authConfig.termsUrl ? <Pressable onPress={() => void Linking.openURL(authConfig.termsUrl!)}><Text style={{ ...typography.caption, color: colors.textSecondary }}>Terms of Service</Text></Pressable> : null}
      {authConfig.termsUrl && authConfig.privacyUrl ? <Text style={{ ...typography.caption, color: colors.textSecondary }}>·</Text> : null}
      {authConfig.privacyUrl ? <Pressable onPress={() => void Linking.openURL(authConfig.privacyUrl!)}><Text style={{ ...typography.caption, color: colors.textSecondary }}>Privacy Policy</Text></Pressable> : null}
    </View>
  </View></AuthScreen>;
}
