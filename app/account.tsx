import { useRef } from "react";
import { Alert, Animated, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton, SecondaryButton, colors } from "@/components/ui";
import { useApp } from "@/context/AppContext";
import { radius, spacing, typography } from "@/theme";
import { TopScrollProtection } from "@/components/top-scroll-protection";
export default function Account() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { user, signOut } = useApp();
  const leave = () =>
    Alert.alert("Sign out?", "You can sign back in anytime.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          signOut();
          router.replace("/(tabs)/profile");
        },
      },
    ]);
  const remove = () =>
    Alert.alert(
      "Delete account?",
      "This will permanently remove your account data.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive" },
      ],
    );
  return (
    <View style={styles.page}>
    <Animated.ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg },
      ]}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true },
      )}
      scrollEventThrottle={16}
    >
      <Text style={styles.title}>Account</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.name ?? "Guest"}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email ?? "Not signed in"}</Text>
      </View>
      <PrimaryButton label="Sign out" onPress={leave} />
      <SecondaryButton label="Delete account" onPress={remove} />
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
    gap: spacing.base,
    backgroundColor: colors.background,
  },
  title: { ...typography.screenTitle, color: colors.text },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderRadius: radius.card,
    gap: 5,
  },
  label: { ...typography.metadata, color: colors.textSecondary, marginTop: 8 },
  value: { ...typography.cardTitle, color: colors.text },
});
