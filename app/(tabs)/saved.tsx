import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { PlaceholderImage, colors, TabScreenHeader } from "@/components/ui";
import { EmptyState } from "@/components/states";
import { recipes } from "@/data/mockRecipes";
import { useApp } from "@/context/AppContext";
import { radius, spacing, typography } from "@/theme";

export default function Saved() {
  const router = useRouter();
  const { savedRecipeIds, toggleSaved } = useApp();
  const [search, setSearch] = useState("");
  const saved = useMemo(
    () =>
      recipes.filter(
        (recipe) =>
          savedRecipeIds.includes(recipe.id) &&
          recipe.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [savedRecipeIds, search],
  );
  return (
    <View style={styles.page}>
      <TabScreenHeader
        title="Saved Recipes"
        subtitle="Recipes you want to cook again"
      />
      <ScrollView contentContainerStyle={styles.content}>
        {savedRecipeIds.length > 0 && (
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search saved recipes"
            placeholderTextColor={colors.textSecondary}
            style={styles.search}
          />
        )}
        {savedRecipeIds.length === 0 ? (
          <EmptyState
            title="No saved recipes yet"
            text="Save recipes you love and they’ll appear here."
            actionLabel="Find meals"
            onAction={() => router.push("/(tabs)")}
          />
        ) : (
          <View style={styles.cards}>
            {saved.map((recipe) => (
              <Pressable
                key={recipe.id}
                onPress={() => router.push(`/recipes/${recipe.id}`)}
                style={styles.card}
              >
                <PlaceholderImage height={112} />
                <View style={styles.body}>
                  <View style={styles.row}>
                    <Text style={styles.cardTitle}>{recipe.title}</Text>
                    <Pressable
                      hitSlop={8}
                      onPress={() => toggleSaved(recipe.id)}
                    >
                      <Text>♥</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.meta}>
                    {recipe.timeMinutes} min • {recipe.difficulty}
                  </Text>
                  <Text style={styles.protein}>{recipe.protein}g protein</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  search: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.button,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.surface,
    ...typography.button,
    color: colors.text,
    marginTop: 6,
  },
  cards: { gap: spacing.md, marginTop: 6 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  body: { padding: spacing.base, gap: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  cardTitle: { ...typography.cardTitle, color: colors.text, flex: 1 },
  meta: { ...typography.metadata, color: colors.textSecondary },
  protein: { ...typography.metadata, color: colors.primaryDark },
});
