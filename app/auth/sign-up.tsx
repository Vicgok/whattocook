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
import { useApp } from "@/context/AppContext";
import { TopScrollProtection } from "@/components/top-scroll-protection";
export default function SignUp() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { signIn, pendingSaveId, toggleSaved, setPendingSaveId } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const submit = () => {
    if (!name || !email || !password || !confirm) {
      setError("Complete all fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    signIn(name, email);
    if (pendingSaveId) {
      toggleSaved(pendingSaveId);
      setPendingSaveId(null);
      router.replace(`/recipes/${pendingSaveId}`);
    } else router.replace("/(tabs)/profile");
  };
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
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.support}>
          Save recipes, keep your pantry, and remember your food preferences.
        </Text>
        {[
          ["Name", name, setName, false],
          ["Email", email, setEmail, false],
          ["Password", password, setPassword, true],
          ["Confirm password", confirm, setConfirm, true],
        ].map(([placeholder, value, onChange, secure]) => (
          <TextInput
            key={placeholder as string}
            value={value as string}
            onChangeText={onChange as (text: string) => void}
            placeholder={placeholder as string}
            secureTextEntry={secure as boolean}
            autoCapitalize="none"
            style={styles.input}
          />
        ))}
        {!!error && <Text style={styles.error}>{error}</Text>}
        <PrimaryButton label="Create account" onPress={submit} />
        <Pressable onPress={() => router.push("/auth/sign-in")}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </Pressable>
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
  link: { ...typography.metadata, color: colors.primary, textAlign: "center" },
  error: { ...typography.metadata, color: colors.error },
});
