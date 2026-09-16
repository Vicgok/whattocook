import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { rankRecipesForPantry } from "@/domain/recipes/recipe-matching";
import { filterCompatibleRecipes } from "@/domain/recipes/recipe-compatibility";
import { useIngredients } from "@/hooks/useIngredients";
import { useRecipes } from "@/hooks/useRecipes";
import { usePantry } from "@/context/PantryContext";
import { useApp } from "@/context/AppContext";
import { colors, SuggestionChip } from "@/components/ui";
import { RecipeCard } from "@/components/RecipeCard";
import {
  EmptyState,
  ErrorState,
  LoadingRecipeCards,
  OfflineBanner,
} from "@/components/states";
import { radius, spacing, typography } from "@/theme";
import { TopScrollProtection } from "@/components/top-scroll-protection";

export default function RecipeResults() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { pantry } = usePantry();
  const { preferences } = useApp();
  const recipesQuery = useRecipes();
  const { data: recipes = [] } = recipesQuery;
  const ingredientsQuery = useIngredients();
  const ingredients = ingredientsQuery.data ?? [];
  const { state: initialState } = useLocalSearchParams<{ state?: string }>();
  const [query, setQuery] = useState("High-protein dinner under 30 minutes");
  const [filter, setFilter] = useState("Best match");
  const eligibleRecipes = filterCompatibleRecipes(recipes, ingredients, {
    dietPreferences: preferences.dietPreferences,
    allergies: preferences.allergies,
    avoidedIngredientIds: preferences.avoidedIngredients
      .filter((item) => item.type === "canonical")
      .map((item) => item.ingredientId),
  });
  const matches = useMemo(
    () =>
      rankRecipesForPantry(eligibleRecipes, pantry, ingredients).sort((a, b) =>
        filter === "Fastest"
          ? a.recipe.timeMinutes - b.recipe.timeMinutes
          : filter === "High protein"
            ? b.recipe.protein - a.recipe.protein
            : b.match.matchPercentage - a.match.matchPercentage ||
              a.match.missingIngredients.length -
                b.match.missingIngredients.length ||
              a.recipe.timeMinutes - b.recipe.timeMinutes,
      ),
    [filter, ingredients, pantry, preferences.avoidedIngredients, recipes],
  );
  const pantryNames = pantry
    .map((item) => ingredients.find((ingredient) => ingredient.id === item.ingredientId)?.name)
    .filter(Boolean);
  const isLoading = recipesQuery.isPending || ingredientsQuery.isPending;
  const hasError = recipesQuery.isError || ingredientsQuery.isError || initialState === "error";
  const isEmpty = initialState === "empty" || (!isLoading && !hasError && matches.length === 0);
  const retry = () => { void recipesQuery.refetch(); void ingredientsQuery.refetch(); };
  return (
    <View style={styles.page}>
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.base },
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text>‹</Text>
          </Pressable>
          <Text style={styles.title}>Meal ideas</Text>
          <View style={{ width: 44 }} />
        </View>
        <TextInput value={query} onChangeText={setQuery} style={styles.query} />
        <OfflineBanner onRetry={retry} />
        {isLoading ? (
          <LoadingRecipeCards />
        ) : hasError ? (
          <ErrorState
            onRetry={retry}
            onBack={() => router.replace("/(tabs)")}
          />
        ) : isEmpty ? (
          <EmptyState
            title="No good matches found"
            text="Try changing your request or adding a few more ingredients."
            actionLabel="Add ingredients"
            onAction={() => router.push("/(tabs)/pantry")}
          />
        ) : (
          <>
            <Text style={styles.heading}>Best matches</Text>
            <Text style={styles.support}>
              Using {pantryNames.join(", ") || "your pantry"}
            </Text>
            <View style={styles.filters}>
              {["Best match", "Fastest", "High protein"].map((item) => (
                <SuggestionChip
                  key={item}
                  label={item}
                  selected={filter === item}
                  onPress={() => setFilter(item)}
                />
              ))}
            </View>
            <View style={styles.cards}>
              {matches.map(({ recipe, match }) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  match={match}
                  onPress={() => router.push(`/recipes/${recipe.id}`)}
                />
              ))}
            </View>
          </>
        )}
      </Animated.ScrollView>
      <TopScrollProtection
        backgroundColor={colors.background}
        scrollY={scrollY}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  title: { ...typography.sectionHeading, color: colors.text },
  query: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.button,
    padding: spacing.base,
    backgroundColor: colors.surface,
    ...typography.button,
    color: colors.text,
  },
  heading: { ...typography.sectionHeading, color: colors.text, marginTop: 6 },
  support: { ...typography.body, color: colors.textSecondary },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cards: { gap: spacing.md },
  test: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    padding: 5,
  },
});
