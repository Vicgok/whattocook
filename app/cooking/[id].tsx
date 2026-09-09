import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { recipeById } from "@/data/mockRecipes";
import { getIngredientById } from "@/data/ingredients";
import {
  colors,
  CookingProgress,
  IngredientRow,
  PlaceholderImage,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui";
import { radius, spacing, typography } from "@/theme";
export default function Cooking() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = recipeById(id);
  const [step, setStep] = useState(Math.min(1, recipe.steps.length - 1));
  const [sheet, setSheet] = useState<"ingredients" | "timer" | "done" | null>(
    null,
  );
  const [seconds, setSeconds] = useState(480);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(
      () => setSeconds((value) => (value > 0 ? value - 1 : 0)),
      1000,
    );
    return () => clearInterval(timer);
  }, [running]);
  const current = recipe.steps[step];
  const finish = () =>
    step === recipe.steps.length - 1
      ? setSheet("done")
      : setStep((value) => value + 1);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0"),
    ss = String(seconds % 60).padStart(2, "0");
  return (
    <View style={styles.page}>
      <View style={{ paddingTop: insets.top }}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close cooking mode"
            onPress={() => router.back()}
            style={styles.exit}
          >
            <Text style={styles.exitIcon}>×</Text>
          </Pressable>
          <Text style={styles.stepLabel}>
            Step {step + 1} of {recipe.steps.length}
          </Text>
          <View style={styles.headerSpace} />
        </View>
      </View>
      <View style={styles.progress}>
        <CookingProgress value={((step + 1) / recipe.steps.length) * 100} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.main}>
        <Text style={styles.number}>{step + 1}</Text>
        <Text style={styles.instruction}>{current.title}</Text>
        <View style={styles.image}>
          <PlaceholderImage height={250} />
        </View>
        <Text style={styles.description}>{current.description}</Text>
        <Text style={styles.duration}>
          Prep time: {current.durationMinutes ?? 2} min
        </Text>
        <Pressable
          onPress={() =>
            Alert.alert("Need help?", "Cooking help will be added later.")
          }
        >
          <Text style={styles.help}>Need help?</Text>
        </Pressable>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.tools}>
          <SecondaryButton
            label="Ingredients"
            onPress={() => setSheet("ingredients")}
            style={{ flex: 1 }}
          />
          <SecondaryButton
            label="Timer"
            onPress={() => setSheet("timer")}
            style={{ flex: 1 }}
          />
        </View>
        <View style={styles.navigation}>
          <SecondaryButton
            label="Previous"
            disabled={step === 0}
            onPress={() => setStep((value) => Math.max(0, value - 1))}
            style={{ flex: 1 }}
          />
          <PrimaryButton
            label={
              step === recipe.steps.length - 1 ? "Finish Cooking" : "Next Step"
            }
            onPress={finish}
            style={{ flex: 1.5 }}
          />
        </View>
      </View>
      <Modal
        visible={sheet !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSheet(null)}
      >
        <View style={styles.overlay}>
          <Pressable
            onPress={() => setSheet(null)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.sheet}>
            {sheet === "ingredients" && (
              <>
                <Text style={styles.sheetTitle}>Recipe ingredients</Text>
                {recipe.ingredients.map((item) => (
                  <IngredientRow
                    key={item.id}
                    name={
                      getIngredientById(item.ingredientId)?.name ??
                      item.ingredientId
                    }
                    status={item.isOptional ? "Optional" : "Required"}
                  />
                ))}
                <PrimaryButton label="Done" onPress={() => setSheet(null)} />
              </>
            )}
            {sheet === "timer" && (
              <>
                <Text style={styles.sheetTitle}>Cook chicken</Text>
                <Text style={styles.timer}>
                  {mm}:{ss}
                </Text>
                <View style={styles.adjust}>
                  <SecondaryButton
                    label="− 1 min"
                    onPress={() =>
                      setSeconds((value) => Math.max(0, value - 60))
                    }
                  />
                  <SecondaryButton
                    label="+ 1 min"
                    onPress={() => setSeconds((value) => value + 60)}
                  />
                </View>
                <PrimaryButton
                  label={running ? "Pause" : "Start"}
                  onPress={() => setRunning((value) => !value)}
                />
                <SecondaryButton
                  label="Done"
                  onPress={() => {
                    setRunning(false);
                    setSheet(null);
                  }}
                />
              </>
            )}
            {sheet === "done" && (
              <>
                <Text style={styles.ready}>Dinner's ready</Text>
                <Text style={styles.recipeName}>{recipe.title}</Text>
                <View style={styles.feedback}>
                  <SecondaryButton label="Loved it" onPress={() => {}} />
                  <SecondaryButton label="Good" onPress={() => {}} />
                  <SecondaryButton label="Not for me" onPress={() => {}} />
                </View>
                <PrimaryButton
                  label="Done"
                  onPress={() => router.replace("/(tabs)")}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  header: {
    height: 60,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  headerSpace: { width: 44 },
  exit: {
    height: 44,
    width: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  exitIcon: { fontSize: 24, lineHeight: 26 },
  stepLabel: {
    flex: 1,
    ...typography.button,
    color: colors.text,
    textAlign: "center",
  },
  progress: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  scroll: { flex: 1 },
  main: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.base,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  image: { alignSelf: "stretch" },
  number: { fontSize: 64, fontWeight: "700", color: colors.primary },
  instruction: {
    ...typography.recipeTitle,
    color: colors.text,
    textAlign: "center",
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 23,
  },
  duration: { ...typography.metadata, color: colors.textSecondary },
  help: {
    ...typography.metadata,
    color: colors.primary,
    textDecorationLine: "underline",
  },
  footer: {
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  tools: { flexDirection: "row", alignItems: "center", gap: 12 },
  navigation: { flexDirection: "row", alignItems: "center", gap: 12 },
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
  timer: {
    fontSize: 52,
    fontVariant: ["tabular-nums"],
    fontWeight: "700",
    textAlign: "center",
  },
  adjust: { flexDirection: "row", gap: 10 },
  ready: { ...typography.screenTitle, color: colors.text, textAlign: "center" },
  recipeName: {
    ...typography.cardTitle,
    textAlign: "center",
    color: colors.textSecondary,
  },
  feedback: { flexDirection: "row", gap: 8 },
});
