import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { usePantry } from "@/context/PantryContext";
import {
  colors,
  IngredientChip,
  IngredientRow,
  PrimaryButton,
  SectionHeader,
  SuggestionChip,
  TabScreenHeader,
} from "@/components/ui";
import { radius, spacing, typography } from "@/theme";
import { EmptyState } from "@/components/states";
import { searchIngredients } from "@/domain/ingredients/ingredient-search";
import { useIngredients } from "@/hooks/useIngredients";
import { useTabContentInset } from "@/hooks/use-tab-content-inset";

const suggestionIds = [
  "chicken",
  "egg",
  "tomato",
  "onion",
  "rice",
  "paneer",
  "potato",
  "bell-pepper",
];

export default function Pantry() {
  const { pantry, addIngredients, removeIngredient } = usePantry();
  const contentBottomInset = useTabContentInset(spacing.xxl);
  const { data: ingredients = [], isPending: ingredientsPending, isError: ingredientsError } = useIngredients();
  const ingredientById = (ingredientId: string) =>
    ingredients.find((ingredient) => ingredient.id === ingredientId);
  const { add } = useLocalSearchParams<{ add?: string }>();
  const [visible, setVisible] = useState(add === "1");
  const [search, setSearch] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (ingredientId: string) =>
    setSelected((old) =>
      old.includes(ingredientId)
        ? old.filter((id) => id !== ingredientId)
        : [...old, ingredientId],
    );
  const shown = pantry.filter((item) =>
    ingredientById(item.ingredientId)
      ?.name.toLowerCase()
      .includes(search.toLowerCase()),
  );
  const matchingIngredients = searchIngredients(
    ingredientSearch,
    ingredients,
  ).map((result) => result.ingredient);
  const suggestions = suggestionIds
    .map(ingredientById)
    .filter((ingredient): ingredient is NonNullable<typeof ingredient> =>
      Boolean(ingredient),
    );

  return (
    <View style={styles.page}>
      <TabScreenHeader title="Your Pantry" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: contentBottomInset }]}
      >
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search your pantry"
          style={styles.search}
        />
        {pantry.length === 0 ? (
          <EmptyState
            title="Your pantry is empty"
            text="Add what you have at home so WhatToCook can suggest better meals."
            actionLabel="Add ingredients"
            onAction={() => setVisible(true)}
          />
        ) : (
          <>
            <SectionHeader>Available ingredients</SectionHeader>
            {shown.map((item) => {
              const ingredient = ingredientById(item.ingredientId);
              return ingredient ? (
                <IngredientRow
                  key={item.id}
                  name={ingredient.name}
                  status="Available"
                  onRemove={() => void removeIngredient(item.ingredientId).catch(() =>
                    Alert.alert("Could not remove ingredient", "Please try again."),
                  )}
                />
              ) : null;
            })}
            <PrimaryButton
              label="+ Add ingredient"
              onPress={() => setVisible(true)}
            />
          </>
        )}
      </ScrollView>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setVisible(false)}
          />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Add Ingredients</Text>
            <Text style={styles.support}>
              Search and choose ingredients you have at home.
            </Text>
            <TextInput
              value={ingredientSearch}
              onChangeText={setIngredientSearch}
              placeholder="Search all ingredients"
              autoFocus
              style={styles.search}
            />
            {ingredientsPending ? <Text style={styles.support}>Loading ingredients…</Text> : ingredientsError ? <Text style={styles.support}>Ingredients are unavailable. Please try again when you are online.</Text> : <View style={styles.chips}>
              {(ingredientSearch ? matchingIngredients : suggestions).map(
                (ingredient) => (
                  <SuggestionChip
                    key={ingredient.id}
                    label={ingredient.name}
                    selected={selected.includes(ingredient.id)}
                    onPress={() => toggle(ingredient.id)}
                  />
                ),
              )}
            </View>}
            {ingredientSearch && matchingIngredients.length === 0 && (
              <Text style={styles.support}>No ingredients found.</Text>
            )}
            {selected.length > 0 && (
              <View style={styles.chips}>
                {selected.map((ingredientId) => {
                  const ingredient = ingredientById(ingredientId);
                  return ingredient ? (
                    <IngredientChip
                      key={ingredientId}
                      label={ingredient.name}
                      removable
                      onPress={() => toggle(ingredientId)}
                    />
                  ) : null;
                })}
              </View>
            )}
            <PrimaryButton
              label={`Add ${selected.length || ""} ingredient${selected.length === 1 ? "" : "s"}`}
              disabled={!selected.length}
              onPress={() => {
                void addIngredients(selected).then(() => {
                  setSelected([]);
                  setIngredientSearch("");
                  setVisible(false);
                }).catch(() => Alert.alert("Could not save pantry changes", "Please try again."));
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.base,
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
  sheetTitle: { ...typography.screenTitle, color: colors.text },
  support: { ...typography.body, color: colors.textSecondary },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
