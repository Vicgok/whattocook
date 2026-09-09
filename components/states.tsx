import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, PrimaryButton, SecondaryButton } from "./ui";

export function EmptyState({
  title,
  text,
  actionLabel,
  onAction,
}: {
  title: string;
  text: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View style={styles.state}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>□</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
      <PrimaryButton
        label={actionLabel}
        onPress={onAction}
        style={{ alignSelf: "stretch" }}
      />
    </View>
  );
}
export function ErrorState({
  title = "We couldn’t find your meals",
  text = "Something went wrong. Try again.",
  onRetry,
  onBack,
}: {
  title?: string;
  text?: string;
  onRetry: () => void;
  onBack?: () => void;
}) {
  return (
    <View style={styles.state}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>!</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
      <PrimaryButton
        label="Try again"
        onPress={onRetry}
        style={{ alignSelf: "stretch" }}
      />
      {onBack && (
        <SecondaryButton
          label="Back to Home"
          onPress={onBack}
          style={{ alignSelf: "stretch" }}
        />
      )}
    </View>
  );
}
export function LoadingRecipeCards() {
  return (
    <View style={styles.state}>
      <ActivityIndicator color={colors.textPrimary} />
      <Text style={styles.title}>Finding meals for you…</Text>
      <Text style={styles.text}>Matching your ingredients and preferences</Text>
      {[1, 2].map((key) => (
        <View key={key} style={styles.skeleton}>
          <View style={styles.image} />
          <View style={styles.lines}>
            <View style={styles.line} />
            <View style={[styles.line, { width: "58%" }]} />
          </View>
        </View>
      ))}
    </View>
  );
}
export function OfflineBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.banner}>
      <View style={{ flex: 1 }}>
        <Text style={styles.bannerTitle}>You’re offline</Text>
        <Text style={styles.bannerText}>
          Some features may not be available.
        </Text>
      </View>
      <SecondaryButton
        label="Retry"
        onPress={onRetry}
        style={{ minHeight: 38 }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  state: { alignItems: "center", paddingVertical: 40, gap: 12 },
  icon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.placeholder,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 28, color: colors.textSecondary },
  title: {
    fontSize: 21,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
  text: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 290,
  },
  skeleton: {
    alignSelf: "stretch",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: { height: 100, backgroundColor: colors.placeholder },
  lines: { padding: 12, gap: 8 },
  line: {
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.placeholder,
    width: "80%",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
  },
  bannerTitle: { fontWeight: "700", color: colors.textPrimary },
  bannerText: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
});
