import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AuthBack,
  AuthError,
  AuthProviderButton,
  AuthScreen,
} from "@/components/auth-screen";
import { colors, radius, spacing, typography } from "@/theme";
import { useApp } from "@/context/AppContext";
const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export default function Email() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { sendMagicLink } = useApp();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    const address = email.trim();
    if (!validEmail(address)) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await sendMagicLink(address);
      router.replace({
        pathname: "/auth/check-email",
        params: { email: address, ...(returnTo ? { returnTo } : {}) },
      });
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "We couldn’t send the sign-in link. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthScreen>
      <View style={{ flex: 1, gap: spacing.xl }}>
        <AuthBack onPress={() => router.back()} />
        <View style={{ gap: spacing.sm, marginTop: spacing.xl }}>
          <Text style={{ ...typography.screenTitle, color: colors.text }}>
            Continue with email
          </Text>
          <Text style={{ ...typography.body, color: colors.textSecondary }}>
            Enter your email address to continue.
          </Text>
        </View>
        <View style={{ gap: spacing.md }}>
          <TextInput
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setError("");
            }}
            placeholder="Email address"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={submit}
            style={{
              minHeight: 52,
              borderWidth: 1,
              borderColor: error ? colors.error : colors.border,
              borderRadius: radius.button,
              paddingHorizontal: spacing.base,
              backgroundColor: colors.surface,
              ...typography.button,
              color: colors.text,
            }}
          />
          {error ? <AuthError>{error}</AuthError> : null}
          <AuthProviderButton
            label={loading ? "Sending…" : "Continue"}
            disabled={loading}
            onPress={submit}
          />
        </View>
      </View>
    </AuthScreen>
  );
}
