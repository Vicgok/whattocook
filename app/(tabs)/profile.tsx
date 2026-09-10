import { ComponentProps, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal as NativeModal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { useRouter } from "expo-router";
import { Settings2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  colors,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
} from "@/components/ui";
import { radius, spacing, typography } from "@/theme";
import { AvoidedIngredient, useApp } from "@/context/AppContext";
import { getIngredientById, ingredients } from "@/data/ingredients";
import { searchIngredients } from "@/domain/ingredients/ingredient-search";
import { TopScrollProtection } from "@/components/top-scroll-protection";

const dietOptions = [
  ["No preference", "Show recipes from all diet types"],
  ["Vegetarian", "No meat or fish"],
  ["Vegan", "No meat, dairy, eggs, or animal products"],
  ["Eggetarian", "Vegetarian meals that may include eggs"],
  ["Pescatarian", "Vegetarian foods plus fish and seafood"],
  ["Jain", "Avoids root vegetables and other restricted ingredients"],
  ["Halal", "Prioritize halal-compatible ingredients and recipes"],
  ["Kosher", "Prioritize kosher-compatible recipes"],
] as const;
const goals = [
  "High protein",
  "High fiber",
  "Low calorie",
  "Low carb",
  "Balanced",
  "Low sodium",
  "Low sugar",
  "Heart healthy",
  "Weight management",
  "Muscle gain",
  "Quick meals",
  "Budget friendly",
];
const allergies = [
  "Peanuts",
  "Tree nuts",
  "Milk / Dairy",
  "Eggs",
  "Wheat",
  "Gluten",
  "Soy",
  "Fish",
  "Shellfish",
  "Sesame",
  "Mustard",
  "Celery",
];
const commonAllergies = allergies.slice(0, 6);
const dietNames: string[] = dietOptions.map(([name]) => name);
const dietConflicts: Record<string, string[]> = {
  Vegan: ["Eggetarian", "Pescatarian"],
  Eggetarian: ["Vegan"],
  Pescatarian: ["Vegan", "Vegetarian"],
  Vegetarian: ["Pescatarian"],
};
type Sheet = "diet" | "goals" | "allergies" | "avoid" | null;
type InfoKind = Exclude<Sheet, null> | null;
const norm = (value: string) => value.trim().toLocaleLowerCase("en-US");
const summary = (items: string[], empty = "None") =>
  !items.length
    ? empty
    : items.length > 2
      ? `${items.slice(0, 2).join(", ")} +${items.length - 2}`
      : items.join(", ");
const sheetCopy = {
  diet: {
    title: "Diet",
    helper: "Choose all that apply to how you usually eat.",
    info: "Your diet preference helps WhatToCook prioritize suitable recipes.\n\nIt does not guarantee that every recipe meets religious, medical, or allergy requirements. Always review ingredients when needed.",
  },
  goals: {
    title: "Nutrition goals",
    helper: "Choose what you'd like meals to prioritize.",
    info: "Nutrition goals help rank recipes toward what matters to you.\n\nYou can choose more than one, and you can change them anytime.",
  },
  allergies: {
    title: "Allergies",
    helper: "Select ingredients that should be treated as allergens.",
    info: "We'll use these selections to help avoid recipes containing those ingredients.\n\nWhatToCook cannot guarantee allergen-free meals or detect cross-contamination. Always verify ingredients and food labels if you have an allergy.",
  },
  avoid: {
    title: "Avoid ingredients",
    helper: "Tell us what you don't want in recommendations.",
    info: "Use this for foods you dislike or prefer not to eat.\n\nFor medical allergies, use the Allergies setting instead.",
  },
} as const;

type AppModalProps = ComponentProps<typeof NativeModal>;
function Modal(props: AppModalProps) {
  return (
    <NativeModal {...props} statusBarTranslucent navigationBarTranslucent />
  );
}

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { isAuthenticated, user, preferences, updatePreferences } = useApp();
  const [sheet, setSheet] = useState<Sheet>(null),
    [info, setInfo] = useState<InfoKind>(null),
    [dietPreferences, setDietPreferences] = useState(
      preferences.dietPreferences,
    ),
    [draft, setDraft] = useState<string[]>([]),
    [avoid, setAvoid] = useState<AvoidedIngredient[]>([]),
    [search, setSearch] = useState(""),
    [custom, setCustom] = useState(""),
    [customOpen, setCustomOpen] = useState(false),
    [dietMessage, setDietMessage] = useState<string | null>(null),
    [allergyMessage, setAllergyMessage] = useState<string | null>(null);
  const open = (kind: Exclude<Sheet, null>) => setSheet(kind);
  useEffect(() => {
    if (!sheet) return;
    setSearch("");
    setCustom("");
    setCustomOpen(false);
    setDietPreferences(preferences.dietPreferences);
    setDietMessage(null);
    setAllergyMessage(null);
    setDraft(
      sheet === "goals"
        ? preferences.nutritionGoals
        : sheet === "allergies"
          ? preferences.allergies
          : [],
    );
    setAvoid(sheet === "avoid" ? preferences.avoidedIngredients : []);
  }, [sheet, preferences]);
  const close = () => setSheet(null);
  const toggle = (value: string) =>
    setDraft((old) => {
      const active = old.some((item) => norm(item) === norm(value));
      setAllergyMessage(
        sheet === "allergies" && old.length === 0 && !active
          ? 'Selecting an allergy turns off "No known allergies".'
          : null,
      );
      return active
        ? old.filter((item) => norm(item) !== norm(value))
        : [...old, value];
    });
  const ingredientResults = useMemo(
    () => searchIngredients(search, ingredients),
    [search],
  );
  const preferenceOptions = useMemo(
    () =>
      (sheet === "goals" ? goals : allergies).filter((item) =>
        norm(item).includes(norm(search)),
      ),
    [sheet, search],
  );
  const avoidLabel = (item: AvoidedIngredient) =>
    item.type === "canonical"
      ? (getIngredientById(item.ingredientId)?.name ?? item.ingredientId)
      : item.value;
  const addAvoid = (id: string) =>
    setAvoid((old) =>
      old.some((item) => item.type === "canonical" && item.ingredientId === id)
        ? old.filter(
            (item) => item.type !== "canonical" || item.ingredientId !== id,
          )
        : [...old, { type: "canonical", ingredientId: id }],
    );
  const updateDietSelection = (value: string) => {
    setDietPreferences((old) => {
      const hasValue = old.some((item) => norm(item) === norm(value));
      if (hasValue) {
        const next = old.filter((item) => norm(item) !== norm(value));
        setDietMessage(null);
        return next.length ? next : ["No preference"];
      }
      if (value === "No preference") {
        setDietMessage(
          old.some((item) => item !== "No preference")
            ? "No preference clears your other diet selections."
            : null,
        );
        return ["No preference"];
      }
      const conflicts = dietConflicts[value] ?? [];
      const removed = old.filter((item) => conflicts.includes(item));
      setDietMessage(
        removed.length
          ? `${value} can't be combined with ${removed.join(", ")}. Selecting ${value} removed ${removed.join(", ")}.`
          : null,
      );
      return [
        ...old.filter(
          (item) => item !== "No preference" && !conflicts.includes(item),
        ),
        value,
      ];
    });
  };
  const addCustom = () => {
    const value = custom.trim();
    if (!value) return;
    if (sheet === "diet") {
      if (!dietPreferences.some((item) => norm(item) === norm(value))) {
        updateDietSelection(value);
      }
    } else if (sheet === "avoid") {
      const exact = searchIngredients(value, ingredients).find(
        (result) =>
          norm(result.ingredient.name) === norm(value) ||
          result.ingredient.aliases.some(
            (alias) => norm(alias) === norm(value),
          ),
      )?.ingredient;
      if (!avoid.some((item) => norm(avoidLabel(item)) === norm(value)))
        setAvoid((old) => [
          ...old,
          exact
            ? { type: "canonical", ingredientId: exact.id }
            : { type: "custom", value },
        ]);
    } else
      setDraft((old) =>
        old.some((item) => norm(item) === norm(value)) ? old : [...old, value],
      );
    setCustom("");
    setCustomOpen(false);
  };
  const save = () => {
    if (sheet === "diet")
      updatePreferences({
        dietPreferences: dietPreferences.length
          ? dietPreferences
          : ["No preference"],
      });
    if (sheet === "goals") updatePreferences({ nutritionGoals: draft });
    if (sheet === "allergies") updatePreferences({ allergies: draft });
    if (sheet === "avoid") updatePreferences({ avoidedIngredients: avoid });
    close();
  };
  const selected =
    sheet === "avoid"
      ? avoid.map((item) => ({
          key:
            item.type === "canonical"
              ? item.ingredientId
              : `custom-${item.value}`,
          label: avoidLabel(item),
          remove: () =>
            setAvoid((old) => old.filter((entry) => entry !== item)),
        }))
      : draft.map((item) => ({
          key: item,
          label: item,
          remove: () => toggle(item),
        }));
  const copy = sheet ? sheetCopy[sheet] : null;
  return (
    <View style={styles.page}>
      <Animated.ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 35 },
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        <Text style={styles.title}>Profile</Text>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text>○</Text>
          </View>
          <View>
            <Text style={styles.name}>
              {isAuthenticated ? user?.name : "Guest"}
            </Text>
            <Text style={styles.muted}>
              {isAuthenticated
                ? user?.email
                : "Personalize your cooking experience"}
            </Text>
          </View>
        </View>
        <SectionHeader>Food Preferences</SectionHeader>
        <SettingsRow
          label="Diet"
          value={summary(preferences.dietPreferences, "No preference")}
          onPress={() => open("diet")}
        />
        <SettingsRow
          label="Nutrition goals"
          value={summary(preferences.nutritionGoals)}
          onPress={() => open("goals")}
        />
        <SettingsRow
          label="Allergies"
          value={summary(preferences.allergies)}
          onPress={() => open("allergies")}
        />
        <SettingsRow
          label="Avoid ingredients"
          value={summary(preferences.avoidedIngredients.map(avoidLabel))}
          onPress={() => open("avoid")}
        />
        <SectionHeader>App Settings</SectionHeader>
        <SettingsRow
          label="Units"
          value={preferences.units}
          onPress={() =>
            updatePreferences({
              units: preferences.units === "Metric" ? "Imperial" : "Metric",
            })
          }
        />
        <View style={styles.setting}>
          <View>
            <Text style={styles.label}>Notifications</Text>
            <Text style={styles.value}>
              {preferences.notificationsEnabled ? "On" : "Off"}
            </Text>
          </View>
          <Switch
            value={preferences.notificationsEnabled}
            onValueChange={(value) =>
              updatePreferences({ notificationsEnabled: value })
            }
          />
        </View>
        <SettingsRow
          label="Appearance"
          value={preferences.appearance}
          onPress={() =>
            Alert.alert("Appearance", "This screen will be added later.")
          }
        />
        <SectionHeader>Account</SectionHeader>
        {isAuthenticated ? (
          <SettingsRow
            label="Account details"
            onPress={() => router.push("/account")}
          />
        ) : (
          <SettingsRow
            label="Sign in"
            onPress={() => router.push("/auth/sign-in")}
          />
        )}
      </Animated.ScrollView>
      <TopScrollProtection backgroundColor={colors.background} scrollY={scrollY} />
      <Modal
        visible={sheet !== null}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <KeyboardAvoidingView
          behavior="padding"
          style={[styles.overlay, styles.bottomAligned]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={close}
            accessibilityLabel="Close preferences"
          />
          {sheet && copy && (
            <View style={styles.preferenceSheetCard}>
              <View style={styles.sheetHeader}>
                <View style={styles.titleBlock}>
                  <View style={styles.titleLine}>
                    <Text style={styles.sheetTitle}>{copy.title}</Text>
                    <InfoButton
                      title={`${copy.title} information`}
                      onPress={() => setInfo(sheet)}
                    />
                  </View>
                  <Text style={styles.support}>{copy.helper}</Text>
                </View>
                <Pressable
                  style={styles.closeButton}
                  onPress={close}
                  accessibilityRole="button"
                  accessibilityLabel={`Close ${copy.title}`}
                >
                  <Text style={styles.closeIcon}>×</Text>
                </Pressable>
              </View>
              <ScrollView
                style={styles.preferenceSheetScroll}
                contentContainerStyle={styles.sheetContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {sheet === "diet" ? (
                  <DietContent
                    dietPreferences={dietPreferences}
                    onToggle={updateDietSelection}
                    message={dietMessage}
                    search={search}
                    setSearch={setSearch}
                    customOpen={customOpen}
                    setCustomOpen={setCustomOpen}
                    custom={custom}
                    setCustom={setCustom}
                    addCustom={addCustom}
                  />
                ) : sheet === "avoid" ? (
                  <AvoidIngredientsContent
                    search={search}
                    setSearch={setSearch}
                    selected={selected}
                    results={ingredientResults}
                    avoid={avoid}
                    onToggle={addAvoid}
                    customOpen={customOpen}
                    setCustomOpen={setCustomOpen}
                    custom={custom}
                    setCustom={setCustom}
                    addCustom={addCustom}
                  />
                ) : (
                  <>
                    <SectionLabel>
                      {sheet === "allergies"
                        ? "SEARCH ALLERGIES"
                        : "SEARCH GOALS"}
                    </SectionLabel>
                    <View style={styles.searchField}>
                      <Text style={styles.searchIcon}>⌕</Text>
                      <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder={
                          sheet === "allergies"
                            ? "Search allergies"
                            : "Search goals"
                        }
                        style={styles.searchInput}
                        placeholderTextColor={colors.textSecondary}
                        accessibilityLabel={`Search ${copy.title}`}
                      />
                    </View>
                    {sheet === "allergies" && (
                      <Pressable
                        style={[
                          styles.noneControl,
                          !draft.length && styles.noneControlSelected,
                        ]}
                        onPress={() => {
                          setDraft([]);
                          setAllergyMessage(null);
                        }}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: !draft.length }}
                      >
                        <SelectionIndicator selected={!draft.length} />
                        <Text style={styles.noneText}>
                          I don't have any known food allergies
                        </Text>
                      </Pressable>
                    )}
                    <SelectedValues items={selected} />
                    {sheet === "allergies" && allergyMessage ? (
                      <InlineNote text={allergyMessage} />
                    ) : null}
                    <PreferenceOptions
                      kind={sheet}
                      options={preferenceOptions}
                      selected={draft}
                      onToggle={toggle}
                      searching={Boolean(search)}
                      query={search}
                      onAddCustom={() => {
                        setCustom(search.trim());
                        setCustomOpen(true);
                      }}
                    />
                    <CustomEntry
                      open={customOpen}
                      setOpen={setCustomOpen}
                      value={custom}
                      setValue={setCustom}
                      onAdd={addCustom}
                      placeholder={
                        sheet === "allergies" ? "e.g. Kiwi" : "e.g. Iron rich"
                      }
                      label={
                        sheet === "allergies"
                          ? "Add another allergy"
                          : "Add custom goal"
                      }
                    />
                  </>
                )}
              </ScrollView>
              <View style={styles.footer}>
                <PrimaryButton
                  label={
                    sheet === "diet"
                      ? "Save diet"
                      : sheet === "goals"
                        ? "Save goals"
                        : sheet === "allergies"
                          ? "Save allergies"
                          : "Save ingredients"
                  }
                  onPress={save}
                />
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </Modal>
      <InfoModal kind={info} onClose={() => setInfo(null)} />
    </View>
  );
}

function DietContent({
  dietPreferences,
  onToggle,
  message,
  search,
  setSearch,
  customOpen,
  setCustomOpen,
  custom,
  setCustom,
  addCustom,
}: {
  dietPreferences: string[];
  onToggle: (value: string) => void;
  message: string | null;
  search: string;
  setSearch: (value: string) => void;
  customOpen: boolean;
  setCustomOpen: (value: boolean) => void;
  custom: string;
  setCustom: (value: string) => void;
  addCustom: () => void;
}) {
  const visibleDiets = dietNames.filter((diet) =>
    norm(diet).includes(norm(search)),
  );
  const selectedDiets = dietPreferences.filter(
    (diet) => diet !== "No preference",
  );
  return (
    <View style={styles.optionStack}>
      <View style={styles.searchField}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search diets"
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
          accessibilityLabel="Search diets"
        />
      </View>
      {selectedDiets.length ? (
        <View style={styles.dietSelectedSection}>
          <SectionLabel>SELECTED</SectionLabel>
          <View style={styles.dietGrid}>
            {selectedDiets.map((name) => (
              <Pressable
                key={name}
                style={[styles.dietChip, styles.dietChipSelected]}
                onPress={() => onToggle(name)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: true }}
              >
                <Text
                  style={[styles.dietChipText, styles.dietChipTextSelected]}
                >
                  ✓ {name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
      <SectionLabel>ALL DIETS</SectionLabel>
      <View style={styles.dietGrid}>
        {visibleDiets.map((name) => {
          const selected = dietPreferences.some(
            (diet) => norm(diet) === norm(name),
          );
          return (
            <Pressable
              key={name}
              style={[styles.dietChip, selected && styles.dietChipSelected]}
              onPress={() => onToggle(name)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
            >
              <Text
                style={[
                  styles.dietChipText,
                  selected && styles.dietChipTextSelected,
                ]}
              >
                {selected ? "✓  " : ""}
                {name}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {visibleDiets.length === 0 ? (
        <View style={styles.dietEmpty}>
          <Text style={styles.empty}>No matching diet</Text>
          <Pressable
            style={styles.customLink}
            onPress={() => {
              setCustom(search.trim());
              setCustomOpen(true);
            }}
            accessibilityRole="button"
          >
            <Text style={styles.customLinkText}>+ Add "{search.trim()}"</Text>
          </Pressable>
        </View>
      ) : null}
      {message ? (
        <View style={styles.dietMessage}>
          <Text style={styles.dietMessageIcon}>i</Text>
          <Text style={styles.dietMessageText}>{message}</Text>
        </View>
      ) : null}
      <CustomEntry
        open={customOpen}
        setOpen={setCustomOpen}
        value={custom}
        setValue={setCustom}
        onAdd={addCustom}
        placeholder="e.g. Flexitarian"
        label="Add custom diet"
      />
    </View>
  );
}
function SelectedValues({
  items,
}: {
  items: { key: string; label: string; remove: () => void }[];
}) {
  if (!items.length) return null;
  return (
    <View style={styles.selectedSection}>
      <SectionLabel>SELECTED</SectionLabel>
      {items.length ? (
        <View style={styles.chips}>
          {items.map((item) => (
            <Pressable
              key={item.key}
              style={[styles.dietChip, styles.dietChipSelected]}
              onPress={item.remove}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${item.label}`}
            >
              <Text style={[styles.dietChipText, styles.dietChipTextSelected]}>
                ✓ {item.label}
              </Text>
              <Text style={styles.removeMark}>×</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>No selections yet</Text>
      )}
    </View>
  );
}
function PreferenceOptions({
  kind,
  options,
  selected,
  onToggle,
  searching,
  query,
  onAddCustom,
}: {
  kind: "goals" | "allergies";
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  searching: boolean;
  query: string;
  onAddCustom: () => void;
}) {
  const visible =
    kind === "allergies" && !searching ? commonAllergies : options;
  const label = searching
    ? "SEARCH RESULTS"
    : kind === "allergies"
      ? "COMMON ALLERGENS"
      : "POPULAR GOALS";
  return (
    <View style={styles.optionSection}>
      <SectionLabel>{label}</SectionLabel>
      <View style={styles.preferenceGrid}>
        {visible.map((option) => {
          const active = selected.some((item) => norm(item) === norm(option));
          return (
            <Pressable
              key={option}
              style={[styles.dietChip, active && styles.dietChipSelected]}
              onPress={() => onToggle(option)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
            >
              <Text
                style={[
                  styles.dietChipText,
                  active && styles.dietChipTextSelected,
                ]}
              >
                {active ? "✓  " : ""}
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {!visible.length ? (
        <View style={styles.dietEmpty}>
          <Text style={styles.empty}>
            No matching {kind === "goals" ? "goal" : "allergy"}
          </Text>
          <Pressable
            style={styles.customLink}
            onPress={onAddCustom}
            accessibilityRole="button"
          >
            <Text style={styles.customLinkText}>+ Add "{query.trim()}"</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
function AvoidIngredientsContent({
  search,
  setSearch,
  selected,
  results,
  avoid,
  onToggle,
  customOpen,
  setCustomOpen,
  custom,
  setCustom,
  addCustom,
}: {
  search: string;
  setSearch: (value: string) => void;
  selected: { key: string; label: string; remove: () => void }[];
  results: ReturnType<typeof searchIngredients>;
  avoid: AvoidedIngredient[];
  onToggle: (id: string) => void;
  customOpen: boolean;
  setCustomOpen: (value: boolean) => void;
  custom: string;
  setCustom: (value: string) => void;
  addCustom: () => void;
}) {
  return (
    <>
      <SectionLabel>SEARCH INGREDIENTS</SectionLabel>
      <View style={styles.searchField}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search ingredients"
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
          accessibilityLabel="Search ingredients"
        />
      </View>
      <SelectedValues items={selected} />
      <IngredientChips
        results={results}
        searching={Boolean(search)}
        avoid={avoid}
        onToggle={onToggle}
        query={search}
        onAddCustom={() => {
          setCustom(search.trim());
          setCustomOpen(true);
        }}
      />
      <CustomEntry
        open={customOpen}
        setOpen={setCustomOpen}
        value={custom}
        setValue={setCustom}
        onAdd={addCustom}
        placeholder="e.g. Black garlic sauce"
        label="Add custom ingredient"
      />
    </>
  );
}

function IngredientChips({
  results,
  searching,
  avoid,
  onToggle,
  query,
  onAddCustom,
}: {
  results: ReturnType<typeof searchIngredients>;
  searching: boolean;
  avoid: AvoidedIngredient[];
  onToggle: (id: string) => void;
  query: string;
  onAddCustom: () => void;
}) {
  return (
    <View style={styles.optionSection}>
      <SectionLabel>
        {searching ? "SEARCH RESULTS" : "SUGGESTIONS"}
      </SectionLabel>
      <View style={styles.dietGrid}>
        {results.map((result) => {
          const active = avoid.some(
            (item) =>
              item.type === "canonical" &&
              item.ingredientId === result.ingredient.id,
          );
          return (
            <Pressable
              key={result.ingredient.id}
              style={[styles.dietChip, active && styles.dietChipSelected]}
              onPress={() => onToggle(result.ingredient.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
            >
              <Text
                style={[
                  styles.dietChipText,
                  active && styles.dietChipTextSelected,
                ]}
              >
                {active ? "✓  " : ""}
                {result.ingredient.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {!results.length ? (
        <View style={styles.dietEmpty}>
          <Text style={styles.empty}>No matching ingredients</Text>
          {query.trim() ? (
            <Pressable
              style={styles.customLink}
              onPress={onAddCustom}
              accessibilityRole="button"
            >
              <Text style={styles.customLinkText}>+ Add "{query.trim()}"</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
function CustomEntry({
  open,
  setOpen,
  value,
  setValue,
  onAdd,
  placeholder,
  label,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  value: string;
  setValue: (value: string) => void;
  onAdd: () => void;
  placeholder: string;
  label: string;
}) {
  return open ? (
    <View style={styles.custom}>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        style={styles.plainInput}
        autoFocus
      />
      <View style={styles.actions}>
        <SecondaryButton
          label="Cancel"
          onPress={() => {
            setValue("");
            setOpen(false);
          }}
          style={styles.actionButton}
        />
        <PrimaryButton
          label="Add"
          onPress={onAdd}
          style={styles.actionButton}
        />
      </View>
    </View>
  ) : (
    <Pressable
      style={styles.customLink}
      onPress={() => setOpen(true)}
      accessibilityRole="button"
    >
      <Text style={styles.customLinkText}>+ {label}</Text>
    </Pressable>
  );
}
function SelectionIndicator({
  selected,
  compact = false,
}: {
  selected: boolean;
  compact?: boolean;
}) {
  return (
    <View
      style={[
        styles.selectionIndicator,
        compact && styles.compactIndicator,
        selected && styles.selectionIndicatorSelected,
      ]}
    >
      {selected && (
        <Text style={[styles.checkMark, compact && styles.compactCheck]}>
          ✓
        </Text>
      )}
    </View>
  );
}
function InlineNote({ text }: { text: string }) {
  return (
    <View style={styles.dietMessage}>
      <Text style={styles.dietMessageIcon}>i</Text>
      <Text style={styles.dietMessageText}>{text}</Text>
    </View>
  );
}
function InfoButton({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.infoButton}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text style={styles.infoGlyph}>i</Text>
    </Pressable>
  );
}
function InfoModal({ kind, onClose }: { kind: InfoKind; onClose: () => void }) {
  return (
    <Modal
      visible={kind !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {kind && (
        <View style={styles.infoOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              About {sheetCopy[kind].title.toLocaleLowerCase("en-US")}
            </Text>
            <Text style={styles.infoText}>{sheetCopy[kind].info}</Text>
            <PrimaryButton label="Got it" onPress={onClose} />
          </View>
        </View>
      )}
    </Modal>
  );
}
function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}
function SettingsRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.setting}>
      <View style={styles.settingCopy}>
        <View style={styles.settingIcon}>
          <Settings2 size={18} color={colors.primary} strokeWidth={2} />
        </View>
        <View>
          <Text style={styles.label}>{label}</Text>
          {value && <Text style={styles.value}>{value}</Text>}
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const baseStyles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm },
  title: { ...typography.screenTitle, color: colors.text },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.base,
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { ...typography.cardTitle, color: colors.text },
  muted: { ...typography.metadata, color: colors.textSecondary, marginTop: 3 },
  setting: {
    minHeight: 58,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.base,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingCopy: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  settingIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  label: { ...typography.cardTitle, color: colors.text },
  value: { ...typography.metadata, color: colors.textSecondary, marginTop: 3 },
  chevron: { fontSize: 24, color: colors.primary },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(23,32,25,.36)",
    paddingHorizontal: 16,
  },
  bottomAligned: { justifyContent: "flex-end" },
  sheetCard: {
    width: "92%",
    maxHeight: "80%",
    maxWidth: 520,
    alignSelf: "center",
    backgroundColor: colors.surface,
    overflow: "hidden",
    borderRadius: radius.modal,
    borderCurve: "continuous",
  },
  sheetHeader: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  titleBlock: { flex: 1, gap: 8 },
  titleLine: { flexDirection: "row", alignItems: "center", gap: 4 },
  sheetTitle: {
    ...typography.sectionHeading,
    color: colors.text,
  },
  support: { ...typography.body, color: colors.textSecondary },
  closeButton: {
    width: 44,
    height: 44,
    marginTop: -8,
    marginRight: -8,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: { fontSize: 30, lineHeight: 34, color: colors.textSecondary },
  infoButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  infoGlyph: {
    width: 21,
    height: 21,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    borderRadius: 11,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 19,
  },
  sheetScroll: { flex: 1 },
  sheetContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sectionLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    letterSpacing: 0.7,
    color: colors.textSecondary,
  },
  selectedSection: { gap: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  selectedChip: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.freshGreen,
  },
  selectedChipText: { fontSize: 14, color: colors.primaryDark },
  removeMark: { fontSize: 20, lineHeight: 20, color: colors.textSecondary },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginTop: -4,
  },
  searchField: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.button,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },
  searchIcon: { fontSize: 23, color: colors.textSecondary, lineHeight: 24 },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: colors.textPrimary,
  },
  optionSection: { gap: 12 },
  optionStack: { gap: 12 },
  dietSelectedSection: { gap: 8 },
  dietGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  dietChip: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 15,
    backgroundColor: colors.surfaceSoft,
  },
  dietChipSelected: {
    borderColor: colors.freshGreen,
    borderWidth: 2,
    backgroundColor: colors.primarySoft,
  },
  dietChipText: { ...typography.metadata, color: colors.textSecondary },
  dietChipTextSelected: { color: colors.primaryDark, fontWeight: "600" },
  dietEmpty: { gap: 4 },
  dietMessage: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: radius.md,
    padding: 12,
    backgroundColor: "#FFF5DE",
  },
  dietMessageIcon: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.pill,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    textAlign: "center",
  },
  dietMessageText: {
    flex: 1,
    ...typography.metadata,
    color: colors.primaryDark,
  },
  dietCard: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedCard: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primarySoft,
  },
  optionCopy: { flex: 1, gap: 4 },
  selectionIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#888",
    alignItems: "center",
    justifyContent: "center",
  },
  selectionIndicatorSelected: {
    borderColor: colors.textPrimary,
    backgroundColor: colors.textPrimary,
  },
  checkMark: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 18,
  },
  compactIndicator: { width: 22, height: 22, borderRadius: 11 },
  compactCheck: { fontSize: 13, lineHeight: 16 },
  preferenceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  preferenceOption: {
    minHeight: 48,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  twoColumnOption: { width: "48.5%" },
  preferenceText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  noneControl: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  noneControlSelected: {
    borderColor: colors.textPrimary,
    backgroundColor: "#F3F3F3",
  },
  noneText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  customLink: { minHeight: 48, justifyContent: "center" },
  customLinkText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  custom: { gap: 10 },
  plainInput: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  actions: { flexDirection: "row", gap: 10 },
  actionButton: { flex: 1 },
  infoOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,.36)",
  },
  infoCard: {
    width: "100%",
    maxWidth: 420,
    gap: 16,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
  },
  infoTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  infoText: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
});

// All four preference variants share this geometry. Keep the card in normal
// flex flow: the overlay centers it, and only the inner ScrollView scrolls.
const centeredOverlay: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: 16,
};
const centeredAlignment: ViewStyle = { justifyContent: "center" };
const resetCloseOffset: ViewStyle = { marginTop: 0, marginRight: 0 };
const preferenceSheetCard: ViewStyle = {
  width: "92%",
  maxWidth: 520,
  maxHeight: "80%",
  alignSelf: "center",
  overflow: "hidden",
  borderRadius: radius.modal,
  backgroundColor: colors.surface,
};
const preferenceSheetScroll: ViewStyle = { flexGrow: 0, flexShrink: 1 };

const styles = {
  ...baseStyles,
  overlay: [baseStyles.overlay, centeredOverlay],
  bottomAligned: centeredAlignment,
  sheetCard: baseStyles.sheetCard,
  preferenceSheetCard,
  preferenceSheetScroll,
  closeButton: [baseStyles.closeButton, resetCloseOffset],
};
