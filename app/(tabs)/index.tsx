import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeRecipeCard } from "@/components/home-recipe-card";
import { usePantry } from "@/context/PantryContext";
import { getIngredientById, ingredients } from "@/data/ingredients";
import { recipes } from "@/data/mockRecipes";
import { matchRecipeToPantry } from "@/domain/ingredients/ingredient-matcher";

const palette = {
  primary: "#3F6B4F",
  primaryDark: "#294936",
  primarySoft: "#E8F2EA",
  freshGreen: "#A9CEB1",
  background: "#FAFBF7",
  surface: "#FFFFFF",
  surfaceSoft: "#F3F5F0",
  text: "#172019",
  textSecondary: "#687069",
  border: "#DDE3DC",
};

const suggestions = ["High protein", "Under 20 min", "Healthy", "Comfort food"];

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pantry } = usePantry();
  const [query, setQuery] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const visiblePantry = pantry.slice(0, 4);
  const hiddenPantryCount = Math.max(0, pantry.length - visiblePantry.length);
  const recommendations = useMemo(
    () =>
      recipes.map((recipe) => ({
        recipe,
        match: matchRecipeToPantry(pantry, recipe.ingredients, ingredients),
      })),
    [pantry],
  );
  const bestMatch = recommendations[0];
  const moreRecipes = recommendations.slice(1, 4);

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Good evening</Text>
          <Text style={styles.heading}>What should we cook?</Text>
        </View>

        <View style={styles.moodSection}>
          <Text style={styles.sectionTitle}>What are you in the mood for?</Text>
          <TextInput
            multiline
            value={query}
            onChangeText={setQuery}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="High-protein dinner under 30 minutes"
            placeholderTextColor={palette.textSecondary}
            style={[styles.input, inputFocused && styles.inputFocused]}
          />
          <View style={styles.quickChoices}>
            <Text style={styles.quickLabel}>Quick choices</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionChips}
            >
              {suggestions.map((suggestion) => {
                const selected = query === suggestion;
                return (
                  <Pressable
                    key={suggestion}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setQuery(suggestion)}
                    style={({ pressed }) => [
                      styles.suggestionChip,
                      selected && styles.suggestionChipSelected,
                      pressed && styles.chipPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.suggestionText,
                        selected && styles.suggestionTextSelected,
                      ]}
                    >
                      {selected ? "✓ " : ""}
                      {suggestion}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>

        <View style={styles.kitchenSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your kitchen</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(tabs)/pantry")}
              style={styles.linkAction}
            >
              <Text style={styles.link}>View all</Text>
            </Pressable>
          </View>
          <View style={styles.kitchenChips}>
            {visiblePantry.map((item) => {
              const ingredient = getIngredientById(item.ingredientId);
              return ingredient ? (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  onPress={() => router.push("/(tabs)/pantry")}
                  style={({ pressed }) => [
                    styles.kitchenChip,
                    pressed && styles.chipPressed,
                  ]}
                >
                  <Text style={styles.kitchenChipText}>{ingredient.name}</Text>
                </Pressable>
              ) : null;
            })}
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                hiddenPantryCount > 0
                  ? router.push("/(tabs)/pantry")
                  : router.push({
                      pathname: "/(tabs)/pantry",
                      params: { add: "1" },
                    })
              }
              style={({ pressed }) => [
                styles.kitchenChip,
                styles.kitchenActionChip,
                pressed && styles.chipPressed,
              ]}
            >
              <Text style={styles.kitchenActionText}>
                {hiddenPantryCount > 0
                  ? `+${hiddenPantryCount}`
                  : "+ Add ingredients"}
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/recipes")}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>Find meals</Text>
        </Pressable>

        {bestMatch ? (
          <View style={styles.bestMatchSection}>
            <View style={styles.recommendationHeading}>
              <Text style={styles.sectionTitle}>Best match for you</Text>
              <Text style={styles.sectionHelper}>
                Based on your pantry and preferences
              </Text>
            </View>
            <HomeRecipeCard
              recipe={bestMatch.recipe}
              matchedCount={bestMatch.match.matchedRequiredCount}
              totalCount={bestMatch.match.totalRequiredCount}
              missingIngredientNames={bestMatch.match.missingIngredients.map(
                (item) =>
                  getIngredientById(item.ingredientId)?.name ??
                  item.ingredientId,
              )}
              onPress={() => router.push(`/recipes/${bestMatch.recipe.id}`)}
            />
          </View>
        ) : null}

        {moreRecipes.length > 0 ? (
          <View style={styles.moreSection}>
            <Text style={styles.sectionTitle}>More you can cook</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moreCards}
            >
              {moreRecipes.map(({ recipe, match }) => (
                <HomeRecipeCard
                  key={recipe.id}
                  compact
                  recipe={recipe}
                  matchedCount={match.matchedRequiredCount}
                  totalCount={match.totalRequiredCount}
                  onPress={() => router.push(`/recipes/${recipe.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.background },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  header: { gap: 4 },
  greeting: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "500",
    color: palette.textSecondary,
  },
  heading: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
    color: palette.text,
  },
  moodSection: { paddingTop: 24, gap: 12 },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "700",
    color: palette.text,
  },
  input: {
    minHeight: 56,
    maxHeight: 96,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: palette.surface,
    fontSize: 16,
    color: palette.text,
    textAlignVertical: "center",
  },
  inputFocused: { borderColor: palette.primary },
  quickChoices: { gap: 10 },
  quickLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
    color: palette.textSecondary,
  },
  suggestionChips: { gap: 8, paddingRight: 20 },
  suggestionChip: {
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 20,
    backgroundColor: palette.surfaceSoft,
  },
  suggestionChipSelected: {
    borderColor: palette.freshGreen,
    backgroundColor: palette.primarySoft,
  },
  suggestionText: { fontSize: 14, color: palette.textSecondary },
  suggestionTextSelected: { fontWeight: "600", color: palette.primaryDark },
  chipPressed: { opacity: 0.72 },
  kitchenSection: { paddingTop: 24, gap: 12 },
  sectionHeader: {
    minHeight: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  linkAction: { minHeight: 44, justifyContent: "center" },
  link: { fontSize: 14, fontWeight: "600", color: palette.primary },
  kitchenChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  kitchenChip: {
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: palette.surfaceSoft,
  },
  kitchenChipText: { fontSize: 14, color: palette.text },
  kitchenActionChip: { borderWidth: 1, borderColor: palette.border },
  kitchenActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.primaryDark,
  },
  primaryButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    borderRadius: 14,
    backgroundColor: palette.primary,
  },
  primaryButtonPressed: { backgroundColor: palette.primaryDark },
  primaryButtonText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
  bestMatchSection: { paddingTop: 30, gap: 14 },
  recommendationHeading: { gap: 3 },
  sectionHelper: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.textSecondary,
  },
  moreSection: { paddingTop: 28, gap: 14 },
  moreCards: { gap: 14, paddingRight: 20 },
});
