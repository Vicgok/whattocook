import { useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { recipeById } from "@/data/mockRecipes";
import { getIngredientById, ingredients } from "@/data/ingredients";
import { matchRecipeToPantry } from "@/domain/ingredients/ingredient-matcher";
import {
  colors,
  IngredientRow,
  PlaceholderImage,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
} from "@/components/ui";
import { radius, spacing, typography } from "@/theme";
import { useApp } from "@/context/AppContext";
import { usePantry } from "@/context/PantryContext";
import { TopScrollProtection } from "@/components/top-scroll-protection";

export default function RecipeDetails() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = recipeById(id);
  const { pantry } = usePantry();
  const { isAuthenticated, savedRecipeIds, toggleSaved, setPendingSaveId } =
    useApp();
  const [prompt, setPrompt] = useState(false);
  const saved = savedRecipeIds.includes(recipe.id);
  const match = matchRecipeToPantry(pantry, recipe.ingredients, ingredients);
  const matchedIds = new Set(match.matchedIngredients.map((item) => item.id));
  const owned = match.matchedIngredients.filter((item) => !item.isOptional);
  const missing = match.missingIngredients;
  const optional = recipe.ingredients.filter((item) => item.isOptional);
  const label = (ingredientId: string) =>
    getIngredientById(ingredientId)?.name ?? ingredientId;
  const save = () => {
    if (isAuthenticated) toggleSaved(recipe.id);
    else {
      setPendingSaveId(recipe.id);
      setPrompt(true);
    }
  };
  return (
    <View style={styles.page}>
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 60 },
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        <PlaceholderImage height={220} />
        <Text style={styles.title}>{recipe.title}</Text>
        <View style={styles.metadata}>
          <Text>{recipe.timeMinutes} min</Text>
          <Text>{recipe.difficulty}</Text>
          <Text>{recipe.calories} kcal</Text>
          <Text>{recipe.protein}g protein</Text>
        </View>
        <View style={styles.why}>
          <Text style={styles.whyTitle}>Ingredient match</Text>
          <Text style={styles.whyText}>
            You have {match.matchedRequiredCount} of {match.totalRequiredCount}{" "}
            required ingredients.
          </Text>
        </View>
        <SectionHeader>Ingredients</SectionHeader>
        <Text style={styles.subhead}>You have</Text>
        {owned.map((item) => (
          <IngredientRow
            key={item.id}
            name={label(item.ingredientId)}
            status="In your pantry"
          />
        ))}
        <Text style={styles.subhead}>Missing</Text>
        {missing.map((item) => (
          <IngredientRow
            key={item.id}
            name={label(item.ingredientId)}
            status="Add to your list"
          />
        ))}
        <Text style={styles.subhead}>Optional</Text>
        {optional.map((item) => (
          <IngredientRow
            key={item.id}
            name={label(item.ingredientId)}
            status={
              matchedIds.has(item.id) ? "In your pantry" : "If you have it"
            }
          />
        ))}
        <View style={styles.preview}>
          <Text style={styles.whyTitle}>
            {recipe.steps.length} cooking steps
          </Text>
          <Text style={styles.whyText}>
            Approx. {recipe.timeMinutes} minutes
          </Text>
        </View>
      </Animated.ScrollView>
      <TopScrollProtection backgroundColor={colors.background} scrollY={scrollY} />
      <View style={[styles.safeHeader, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={styles.circle}
          >
            <Text style={styles.headerIcon}>‹</Text>
          </Pressable>
          <View style={styles.headerSpace} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={saved ? "Remove saved recipe" : "Save recipe"}
            onPress={save}
            style={styles.circle}
          >
            <Text style={styles.headerIcon}>{saved ? "♥" : "♡"}</Text>
          </Pressable>
        </View>
      </View>
      <View style={[styles.sticky, { paddingBottom: insets.bottom + 12 }]}>
        <SecondaryButton
          label={saved ? "Saved" : "Save"}
          onPress={save}
          style={{ flex: 1 }}
        />
        <PrimaryButton
          label="Start Cooking"
          onPress={() => router.push(`/cooking/${recipe.id}`)}
          style={{ flex: 2 }}
        />
      </View>
      <Modal
        visible={prompt}
        transparent
        animationType="slide"
        onRequestClose={() => setPrompt(false)}
      >
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setPrompt(false)}
          />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Save this recipe?</Text>
            <Text style={styles.whyText}>
              Create an account or sign in to keep your saved recipes.
            </Text>
            <PrimaryButton
              label="Create account"
              onPress={() => {
                setPrompt(false);
                router.push("/auth/sign-up");
              }}
            />
            <SecondaryButton
              label="Sign in"
              onPress={() => {
                setPrompt(false);
                router.push("/auth/sign-in");
              }}
            />
            <Pressable onPress={() => setPrompt(false)}>
              <Text style={styles.notNow}>Not now</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  header: {
    height: 60,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  safeHeader: {
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 2,
  },
  headerSpace: { flex: 1 },
  circle: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  headerIcon: { fontSize: 24, lineHeight: 26 },
  title: { ...typography.recipeTitle, color: colors.text },
  metadata: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  why: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.card,
    padding: spacing.base,
    gap: 6,
  },
  whyTitle: { ...typography.cardTitle, color: colors.text },
  whyText: { ...typography.body, color: colors.textSecondary },
  subhead: { ...typography.cardTitle, color: colors.text, marginTop: 3 },
  preview: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.card,
    padding: spacing.base,
    gap: 5,
  },
  sticky: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(23,32,25,.28)",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.modal,
    borderTopRightRadius: radius.modal,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sheetTitle: { ...typography.sectionHeading, color: colors.text },
  notNow: {
    ...typography.metadata,
    color: colors.primary,
    textAlign: "center",
    padding: 8,
  },
});
