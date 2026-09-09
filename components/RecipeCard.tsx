import { Pressable, StyleSheet, Text, View } from "react-native";
import { Recipe } from "@/types/recipe";
import { RecipeMatchResult } from "@/domain/ingredients/ingredient.types";
import { getIngredientById } from "@/data/ingredients";
import { colors, PlaceholderImage } from "./ui";

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
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "white",
  },
  compact: { flexDirection: "row" },
  body: { padding: 12, gap: 4, flex: 1 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
  },
  meta: { fontSize: 13, color: colors.textSecondary },
  protein: { fontSize: 14, fontWeight: "600", marginTop: 4 },
  match: { fontSize: 13, color: colors.textSecondary },
  missing: { fontSize: 13, color: colors.textSecondary },
  view: { fontSize: 14, fontWeight: "700", marginTop: 4 },
});
