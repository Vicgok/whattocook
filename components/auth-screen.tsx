import { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/theme";

export function AuthScreen({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: insets.top + spacing.xxl,
        paddingBottom: insets.bottom + spacing.lg,
        backgroundColor: colors.background,
      }}
    >
      <View
        style={{ flex: 1, maxWidth: 460, width: "100%", alignSelf: "center" }}
      >
        {children}
      </View>
    </ScrollView>
  );
}
export function AuthBack({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      hitSlop={12}
      style={({ pressed }) => ({
        alignSelf: "flex-start",
        minHeight: 44,
        justifyContent: "center",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ ...typography.button, color: colors.primary }}>
        ‹ Back
      </Text>
    </Pressable>
  );
}
export function AuthProviderButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 52,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.button,
        backgroundColor: colors.surface,
        opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
      })}
    >
      <Text style={{ ...typography.button, color: colors.text }}>{label}</Text>
    </Pressable>
  );
}
export function AuthError({ children }: { children: ReactNode }) {
  return (
    <Text
      selectable
      style={{
        ...typography.metadata,
        color: colors.error,
        textAlign: "center",
        lineHeight: 20,
      }}
    >
      {children}
    </Text>
  );
}
