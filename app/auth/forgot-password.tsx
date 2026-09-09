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
import { PrimaryButton, colors } from "@/components/ui";
export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <ScrollView contentContainerStyle={styles.content}>
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
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: 20, paddingTop: 58 },
  back: { fontSize: 16 },
  body: { gap: 16, marginTop: 48 },
  title: { fontSize: 30, fontWeight: "700" },
  support: { fontSize: 15, color: colors.textSecondary, lineHeight: 21 },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
});
