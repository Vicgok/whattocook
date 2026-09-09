import { type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/theme";

export { colors, radius, spacing, typography } from "@/theme";

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};
export function PrimaryButton({
  label,
  onPress,
  disabled,
  style,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primary,
        disabled && styles.disabled,
        pressed && !disabled && styles.primaryPressed,
        style,
      ]}
    >
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}
export function SecondaryButton({
  label,
  onPress,
  disabled,
  style,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondary,
        disabled && styles.disabled,
        pressed && !disabled && styles.secondaryPressed,
        style,
      ]}
    >
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}
export function IngredientChip({
  label,
  onPress,
  removable,
}: {
  label: string;
  onPress?: () => void;
  removable?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
    >
      <Text style={styles.chipText}>
        {label}
        {removable ? "  ×" : ""}
      </Text>
    </Pressable>
  );
}
export function SuggestionChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selectedChip,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.chipText, selected && styles.selectedChipText]}>
        {label}
      </Text>
    </Pressable>
  );
}
export function SectionHeader({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {action}
    </View>
  );
}
export function TabScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top }}>
      <View style={styles.tabHeader}>
        <View style={styles.tabTitleArea}>
          <Text style={styles.tabTitle}>{title}</Text>
          {subtitle ? <Text style={styles.tabSubtitle}>{subtitle}</Text> : null}
        </View>
        {right ? <View style={styles.tabHeaderAction}>{right}</View> : null}
      </View>
    </View>
  );
}
export function PlaceholderImage({ height = 112 }: { height?: number }) {
  return (
    <View style={[styles.placeholder, { height }]}>
      <Text style={styles.placeholderText}>Recipe image</Text>
    </View>
  );
}
export function IngredientRow({
  name,
  status,
  onRemove,
}: {
  name: string;
  status?: string;
  onRemove?: () => void;
}) {
  return (
    <View style={styles.ingredientRow}>
      <View style={styles.check}>
        <Text style={styles.checkText}>✓</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowName}>{name}</Text>
        {status && <Text style={styles.rowStatus}>{status}</Text>}
      </View>
      {onRemove && (
        <Pressable accessibilityRole="button" hitSlop={10} onPress={onRemove}>
          <Text style={styles.remove}>Remove</Text>
        </Pressable>
      )}
    </View>
  );
}
export function CookingProgress({ value }: { value: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${value}%` }]} />
    </View>
  );
}

export const styles = StyleSheet.create({
  primary: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.base,
    borderRadius: radius.button,
    backgroundColor: colors.primary,
  },
  primaryPressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  primaryText: { ...typography.button, color: colors.surface },
  secondary: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.button,
    backgroundColor: colors.surface,
  },
  secondaryPressed: {
    backgroundColor: colors.surfaceSoft,
    transform: [{ scale: 0.98 }],
  },
  secondaryText: { ...typography.button, color: colors.text },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
  chip: {
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
  },
  selectedChip: {
    borderColor: colors.freshGreen,
    backgroundColor: colors.primarySoft,
  },
  chipText: { fontSize: 14, lineHeight: 18, color: colors.text },
  selectedChipText: { fontWeight: "600", color: colors.primaryDark },
  sectionHeader: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { ...typography.sectionHeading, color: colors.text },
  tabHeader: {
    minHeight: 96,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
  },
  tabTitleArea: { gap: spacing.xs },
  tabTitle: { ...typography.screenTitle, color: colors.text },
  tabSubtitle: { ...typography.body, color: colors.textSecondary },
  tabHeaderAction: {
    position: "absolute",
    right: spacing.lg,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.card,
    backgroundColor: colors.surfaceSoft,
  },
  placeholderText: { ...typography.metadata, color: colors.textSecondary },
  ingredientRow: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  check: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  checkText: { color: colors.primaryDark, fontWeight: "700" },
  rowName: { ...typography.cardTitle, color: colors.text },
  rowStatus: {
    ...typography.metadata,
    color: colors.textSecondary,
    marginTop: 2,
  },
  remove: { ...typography.metadata, color: colors.primary },
  progressTrack: {
    height: 8,
    overflow: "hidden",
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
});
