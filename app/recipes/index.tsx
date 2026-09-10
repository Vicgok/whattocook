import { useEffect, useMemo, useRef, useState } from "react";
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
import { recipes } from "@/data/mockRecipes";
import { getIngredientById, ingredients } from "@/data/ingredients";
import { matchRecipeToPantry } from "@/domain/ingredients/ingredient-matcher";
import { usePantry } from "@/context/PantryContext";
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
  const { state: initialState } = useLocalSearchParams<{ state?: string }>();
  const [query, setQuery] = useState("High-protein dinner under 30 minutes");
  const [filter, setFilter] = useState("Best match");
  const [state, setState] = useState(
    initialState === "error"
      ? "error"
      : initialState === "empty"
        ? "empty"
        : "loading",
  );
  useEffect(() => {
    if (state !== "loading") return;
    const timer = setTimeout(() => setState("results"), 900);
    return () => clearTimeout(timer);
  }, [state]);
  const matches = useMemo(
    () =>
      recipes
        .map((recipe) => ({
          recipe,
          match: matchRecipeToPantry(pantry, recipe.ingredients, ingredients),
        }))
        .sort((a, b) =>
          filter === "Fastest"
            ? a.recipe.timeMinutes - b.recipe.timeMinutes
            : filter === "High protein"
              ? b.recipe.protein - a.recipe.protein
              : b.match.matchPercentage - a.match.matchPercentage ||
                a.match.missingIngredients.length -
                  b.match.missingIngredients.length ||
                a.recipe.timeMinutes - b.recipe.timeMinutes,
        ),
    [filter, pantry],
  );
  const pantryNames = pantry
    .map((item) => getIngredientById(item.ingredientId)?.name)
    .filter(Boolean);
  const retry = () => setState("loading");
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
      {state === "loading" ? (
        <LoadingRecipeCards />
      ) : state === "error" ? (
        <ErrorState onRetry={retry} onBack={() => router.replace("/(tabs)")} />
      ) : state === "empty" ? (
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
          <Pressable onPress={() => setState("empty")}>
            <Text style={styles.test}>Show no-results state</Text>
          </Pressable>
          <Pressable onPress={() => setState("error")}>
            <Text style={styles.test}>Show error state</Text>
          </Pressable>
        </>
      )}
    </Animated.ScrollView>
    <TopScrollProtection backgroundColor={colors.background} scrollY={scrollY} />
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
