import { Pressable, StyleSheet, Text, View } from "react-native";
import { Recipe } from "@/types/recipe";
import { colors as palette, radius, spacing, typography } from "@/theme";

export function HomeRecipeCard({
  recipe,
  matchedCount,
  totalCount,
  missingIngredientNames = [],
  compact = false,
  onPress,
}: {
  recipe: Recipe;
  matchedCount: number;
  totalCount: number;
  missingIngredientNames?: string[];
  compact?: boolean;
  onPress: () => void;
}) {
  const hasEverything = matchedCount === totalCount;
  const availability = hasEverything
    ? "You have everything"
    : `${matchedCount}/${totalCount} available`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${recipe.title}, ${recipe.timeMinutes} minutes, ${recipe.difficulty}, ${availability}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact && styles.compactCard,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={[styles.image, compact && styles.compactImage]}>
        <Text style={styles.imageLabel}>Recipe image</Text>
      </View>
      <View style={[styles.body, compact && styles.compactBody]}>
        <Text
          numberOfLines={compact ? 2 : undefined}
          style={[styles.title, compact && styles.compactTitle]}
        >
          {recipe.title}
        </Text>
        <Text style={[styles.meta, compact && styles.compactMeta]}>
          {recipe.timeMinutes} min · {recipe.difficulty}
          {!compact ? ` · ${recipe.protein}g protein` : ""}
        </Text>
        <View style={styles.matchChip}>
          <Text style={styles.matchText}>{availability}</Text>
        </View>
        {!compact && !hasEverything && missingIngredientNames.length > 0 ? (
          <Text numberOfLines={1} style={styles.missing}>
            Missing: {missingIngredientNames.slice(0, 2).join(", ")}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.lg,
    backgroundColor: palette.surface,
  },
  compactCard: { width: 236, borderRadius: radius.card },
  cardPressed: { opacity: 0.88 },
  image: {
    width: "100%",
    aspectRatio: 16 / 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surfaceSoft,
  },
  compactImage: { aspectRatio: 16 / 9 },
  imageLabel: { fontSize: 13, color: palette.textSecondary },
  body: { alignItems: "flex-start", padding: spacing.base, gap: 7 },
  compactBody: { minHeight: 132, padding: 14, gap: 5 },
  title: {
    ...typography.cardTitle,
    color: palette.text,
  },
  compactTitle: typography.cardTitle,
  meta: {
    ...typography.metadata,
    color: palette.textSecondary,
  },
  compactMeta: { lineHeight: 18 },
  matchChip: {
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: 11,
    borderRadius: radius.pill,
    backgroundColor: palette.primarySoft,
  },
  matchText: { fontSize: 13, fontWeight: "600", color: palette.primaryDark },
  missing: { maxWidth: "100%", fontSize: 13, color: palette.textSecondary },
});
