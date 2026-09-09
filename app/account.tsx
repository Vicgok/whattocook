import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { PrimaryButton, SecondaryButton, colors } from "@/components/ui";
import { useApp } from "@/context/AppContext";
export default function Account() {
  const router = useRouter();
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
    <ScrollView contentContainerStyle={styles.content}>
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
    padding: 20,
    paddingTop: 58,
    gap: 16,
    backgroundColor: "white",
  },
  title: { fontSize: 28, fontWeight: "700" },
  card: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    gap: 5,
  },
  label: { fontSize: 13, color: colors.textSecondary, marginTop: 8 },
  value: { fontSize: 17, fontWeight: "600" },
});
