import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AuthBack, AuthScreen } from "@/components/auth-screen";
import { colors, spacing, typography } from "@/theme";
export default function CheckEmail() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  return (
    <AuthScreen>
      <View style={{ flex: 1, gap: spacing.xl }}>
        <AuthBack onPress={() => router.back()} />
        <View style={{ gap: spacing.sm, marginTop: spacing.xl }}>
          <Text style={{ ...typography.screenTitle, color: colors.text }}>
            Check your email
          </Text>
          <Text
            selectable
            style={{ ...typography.body, color: colors.textSecondary }}
          >
            We sent a secure sign-in link to {email ?? "your email address"}.
            Open it on this device to continue.
          </Text>
        </View>
        <Text style={{ ...typography.metadata, color: colors.textSecondary }}>
          Didn’t receive it? Check your spam folder, then try again.
        </Text>
      </View>
    </AuthScreen>
  );
}
