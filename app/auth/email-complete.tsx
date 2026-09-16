import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AuthError, AuthScreen } from "@/components/auth-screen";
import { getSupabaseClient } from "@/lib/supabase";
import { colors, spacing, typography } from "@/theme";
export default function EmailComplete() {
  const router = useRouter(); const { code } = useLocalSearchParams<{ code?: string }>(); const [error, setError] = useState("");
  useEffect(() => { let active = true; const finish = async () => { if (!code) { if (active) setError("This sign-in link is invalid or has expired. Request a new one."); return; } const client = getSupabaseClient(); if (!client) { if (active) setError("Sign-in is not configured on this device."); return; } const { error: exchangeError } = await client.auth.exchangeCodeForSession(code); if (exchangeError) { if (active) setError(exchangeError.message.includes("expired") ? "This sign-in link has expired. Request a new one." : "We couldn’t complete sign-in. Please request a new link."); return; } router.replace("/(tabs)/profile"); }; void finish(); return () => { active = false; }; }, [code, router]);
  return <AuthScreen><View style={{ flex: 1, justifyContent: "center", gap: spacing.md }}><Text style={{ ...typography.screenTitle, color: colors.text, textAlign: "center" }}>{error ? "Sign-in needs another try" : "Signing you in…"}</Text>{error ? <AuthError>{error}</AuthError> : <Text style={{ ...typography.body, color: colors.textSecondary, textAlign: "center" }}>Please keep WhatToCook open for a moment.</Text>}</View></AuthScreen>;
}
