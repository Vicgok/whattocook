import { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton, colors } from "@/components/ui";
import { radius, spacing, typography } from "@/theme";
import { TopScrollProtection } from "@/components/top-scroll-protection";
export default function ForgotPassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <View style={styles.page}>
    <Animated.ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.base },
      ]}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true },
      )}
      scrollEventThrottle={16}
    >
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>‹ Back</Text>
      </Pressable>
      <View style={styles.body}>
        {sent ? (
          <>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.support}>
              We sent password reset instructions to{`\n`}
              {email}
            </Text>
            <PrimaryButton
              label="Back to sign in"
              onPress={() => router.replace("/auth/sign-in")}
            />
          </>
        ) : (
          <>
            <Text style={styles.title}>Reset password</Text>
            <Text style={styles.support}>
              Enter your email and we’ll send you a reset link.
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
            <PrimaryButton
              label="Send reset link"
              onPress={() => setSent(true)}
            />
          </>
        )}
      </View>
    </Animated.ScrollView>
    <TopScrollProtection backgroundColor={colors.background} scrollY={scrollY} />
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  back: { ...typography.button, color: colors.primary },
  body: { gap: spacing.base, marginTop: spacing.xxxl },
  title: { ...typography.display, color: colors.text },
  support: { ...typography.body, color: colors.textSecondary },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.button,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.surface,
    ...typography.button,
    color: colors.text,
  },
});
