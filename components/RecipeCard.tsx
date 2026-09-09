import { Pressable, StyleSheet, Text, View } from "react-native";
import { Recipe } from "@/types/recipe";
import { RecipeMatchResult } from "@/domain/ingredients/ingredient.types";
import { getIngredientById } from "@/data/ingredients";
import { colors, PlaceholderImage } from "./ui";
import { radius, spacing, typography } from "@/theme";

export function RecipeCard({
  recipe,
  match,
  onPress,
  compact = false,
}: {
  recipe: Recipe;
  match?: RecipeMatchResult;
  onPress: () => void;
  compact?: boolean;
}) {
  const missingNames =
    match?.missingIngredients
      .map((item) => getIngredientById(item.ingredientId)?.name)
      .filter(Boolean) ?? [];
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, compact && styles.compact]}
    >
      <PlaceholderImage height={compact ? 80 : 140} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{recipe.title}</Text>
          {!compact && (
            <Pressable hitSlop={8}>
              <Text>♡</Text>
            </Pressable>
          )}
        </View>
        <Text style={styles.meta}>
          {recipe.timeMinutes} min • {recipe.difficulty}
        </Text>
        {!compact && match && (
          <>
            <Text style={styles.protein}>{recipe.protein}g protein</Text>
            <Text style={styles.match}>
              You have {match.matchedRequiredCount} of{" "}
              {match.totalRequiredCount} ingredients
            </Text>
            <Text style={styles.missing}>
              {missingNames.length
                ? `Missing: ${missingNames.join(", ")}`
                : "All required ingredients available"}
            </Text>
            <Text style={styles.view}>View recipe ›</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  compact: { flexDirection: "row" },
  body: { padding: spacing.base, gap: 6, flex: 1 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  title: {
    ...typography.cardTitle,
    color: colors.textPrimary,
    flex: 1,
  },
  meta: { ...typography.metadata, color: colors.textSecondary },
  protein: { ...typography.metadata, color: colors.text, marginTop: 4 },
  match: { ...typography.metadata, color: colors.primaryDark },
  missing: { ...typography.metadata, color: colors.textSecondary },
  view: { ...typography.metadata, color: colors.primary, marginTop: 4 },
});
