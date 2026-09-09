import { Pressable, StyleSheet, Text, View } from "react-native";
import { Recipe } from "@/types/recipe";

const palette = {
  primaryDark: "#294936",
  primarySoft: "#E8F2EA",
  surface: "#FFFFFF",
  surfaceSoft: "#F3F5F0",
  text: "#172019",
  textSecondary: "#687069",
  border: "#DDE3DC",
};

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
    borderRadius: 20,
    backgroundColor: palette.surface,
  },
  compactCard: { width: 236, borderRadius: 18 },
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
  body: { alignItems: "flex-start", padding: 16, gap: 7 },
  compactBody: { minHeight: 132, padding: 14, gap: 5 },
  title: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "700",
    color: palette.text,
  },
  compactTitle: { fontSize: 17, lineHeight: 22, fontWeight: "600" },
  meta: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
    color: palette.textSecondary,
  },
  compactMeta: { lineHeight: 18 },
  matchChip: {
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: 11,
    borderRadius: 15,
    backgroundColor: palette.primarySoft,
  },
  matchText: { fontSize: 13, fontWeight: "600", color: palette.primaryDark },
  missing: { maxWidth: "100%", fontSize: 13, color: palette.textSecondary },
});
