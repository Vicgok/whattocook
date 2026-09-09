import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton, SecondaryButton, colors } from "@/components/ui";
import { radius, spacing, typography } from "@/theme";
import { useApp } from "@/context/AppContext";
export default function SignIn() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, pendingSaveId, toggleSaved, setPendingSaveId } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    signIn(undefined, email);
    if (pendingSaveId) {
      toggleSaved(pendingSaveId);
      setPendingSaveId(null);
      router.replace(`/recipes/${pendingSaveId}`);
    } else router.replace("/(tabs)/profile");
  };
  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.base },
      ]}
    >
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>‹ Back</Text>
      </Pressable>
      <View style={styles.body}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.support}>
          Sign in to keep your recipes and preferences synced.
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={styles.input}
        />
        <Pressable onPress={() => router.push("/auth/forgot-password")}>
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>
        {!!error && <Text style={styles.error}>{error}</Text>}
        <PrimaryButton label="Sign in" onPress={submit} />
        <SecondaryButton
          label="Create account"
          onPress={() => router.push("/auth/sign-up")}
        />
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  back: { ...typography.button, color: colors.primary },
  body: { gap: spacing.md, marginTop: spacing.xxxl },
  title: { ...typography.display, color: colors.text },
  support: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: 12,
  },
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
  link: { ...typography.metadata, color: colors.primary },
  error: { ...typography.metadata, color: colors.error },
});
