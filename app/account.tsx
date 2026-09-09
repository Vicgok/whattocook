import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton, SecondaryButton, colors } from "@/components/ui";
import { useApp } from "@/context/AppContext";
import { radius, spacing, typography } from "@/theme";
export default function Account() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg },
      ]}
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
    </ScrollView>
  );
}
const styles = StyleSheet.create({
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
