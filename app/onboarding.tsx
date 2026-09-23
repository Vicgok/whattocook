import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AccessibilityInfo,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, Clock3, Info, Sparkles } from "lucide-react-native";
import { PrimaryButton, colors } from "@/components/ui";
import { radius, spacing, typography } from "@/theme";
import { useSupabaseSession } from "@/context/SupabaseSessionContext";
import {
  markDeviceOnboardingCompleted,
} from "@/lib/onboarding-completion";
import { queryKeys } from "@/lib/query-keys";
import { completeOnboarding } from "@/repositories/profile.repository";
import { upsertPreferences } from "@/services/preferences.service";
import type { UserPreferences } from "@/context/AppContext";
import {
  ALLERGEN_LABELS,
  ALLERGENS,
  BASE_DIET_LABELS,
  BASE_DIETS,
  legacyBaseDiet,
  NUTRITION_GOAL_LABELS,
  NUTRITION_GOALS,
} from "@/domain/preferences/dietary";

const defaultPreferences: UserPreferences = {
  dietPreferences: [], baseDiet: null, glutenFree: false, dairyFree: false,
  nutritionGoals: [],
  allergies: [],
  avoidedIngredients: [],
  units: "Metric",
  notificationsEnabled: true,
  appearance: "System default",
};
const diets = BASE_DIETS.map((diet) => BASE_DIET_LABELS[diet]);
const goals = NUTRITION_GOALS.map((goal) => NUTRITION_GOAL_LABELS[goal]);
const allergies = ALLERGENS.map((allergen) => ALLERGEN_LABELS[allergen]);
const avoids = ["Mushrooms", "Coriander", "Onion", "Tomato"];

function Progress({ step }: { step: number }) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: 3, now: step + 1 }}
      style={{ flexDirection: "row", gap: spacing.sm }}
    >
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={{
            width: index === step ? 22 : 7,
            height: 7,
            borderRadius: radius.pill,
            backgroundColor: index === step ? colors.primary : colors.border,
          }}
        />
      ))}
    </View>
  );
}

function Choice({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => ({
        minHeight: 44,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        justifyContent: "center",
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.border,
        borderRadius: radius.pill,
        backgroundColor: selected ? colors.primarySoft : colors.surface,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      {selected ? (
        <Check size={15} strokeWidth={3} color={colors.primaryDark} />
      ) : null}
      <Text
        style={{
          ...typography.metadata,
          color: selected ? colors.primaryDark : colors.text,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PreviewCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  return (
    <View
      style={[
        {
          borderRadius: radius.card,
          backgroundColor: colors.surface,
          padding: spacing.base,
          gap: spacing.sm,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function WelcomeVisual() {
  return (
    <View style={{ width: "100%", alignItems: "center", gap: spacing.lg }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: radius.card,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.accent,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            lineHeight: 32,
            fontWeight: "700",
            color: colors.primaryDark,
          }}
        >
          W
        </Text>
      </View>
      <Text style={{ ...typography.screenTitle, color: colors.surface }}>
        WhatToCook
      </Text>
      <PreviewCard style={{ width: "88%", gap: spacing.md }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ gap: 2 }}>
            <Text
              style={{ ...typography.metadata, color: colors.textSecondary }}
            >
              From your kitchen
            </Text>
            <Text style={{ ...typography.cardTitle, color: colors.text }}>
              Tonight’s idea
            </Text>
          </View>
          <Sparkles size={21} color={colors.accent} fill={colors.accent} />
        </View>
        <View
          style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}
        >
          {["Eggs", "Tomato", "Spinach"].map((item) => (
            <View
              key={item}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: radius.pill,
                backgroundColor: colors.primarySoft,
              }}
            >
              <Text
                style={{ ...typography.caption, color: colors.primaryDark }}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>
      </PreviewCard>
    </View>
  );
}

function PantryVisual() {
  return (
    <View style={{ width: "88%", alignItems: "center", gap: spacing.md }}>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: spacing.sm,
        }}
      >
        {["Eggs", "Tomato", "Spinach"].map((item) => (
          <View
            key={item}
            style={{
              paddingHorizontal: 13,
              paddingVertical: 8,
              borderRadius: radius.pill,
              backgroundColor: colors.surface,
            }}
          >
            <Text style={{ ...typography.metadata, color: colors.primaryDark }}>
              {item}
            </Text>
          </View>
        ))}
      </View>
      <Text
        accessibilityLabel="Ingredients become a recipe"
        style={{
          fontSize: 20,
          lineHeight: 24,
          fontWeight: "700",
          color: colors.primaryDark,
        }}
      >
        ↓
      </Text>
      <PreviewCard style={{ width: "100%", gap: 5 }}>
        <Text style={{ ...typography.cardTitle, color: colors.text }}>
          Spinach Omelette
        </Text>
        <Text style={{ ...typography.metadata, color: colors.textSecondary }}>
          15 min · 3/3 ingredients
        </Text>
      </PreviewCard>
    </View>
  );
}

function MoodVisual() {
  return (
    <View style={{ width: "88%", gap: spacing.md }}>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: spacing.sm,
        }}
      >
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: radius.pill,
            backgroundColor: colors.primarySoft,
          }}
        >
          <Text style={{ ...typography.metadata, color: colors.primaryDark }}>
            Comfort food
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: radius.pill,
            backgroundColor: colors.surface,
          }}
        >
          <Clock3 size={14} color={colors.primaryDark} />
          <Text style={{ ...typography.metadata, color: colors.primaryDark }}>
            20 min
          </Text>
        </View>
      </View>
      <PreviewCard style={{ gap: 5 }}>
        <Text style={{ ...typography.metadata, color: colors.primary }}>
          Made for your evening
        </Text>
        <Text style={{ ...typography.cardTitle, color: colors.text }}>
          Creamy one-pot pasta
        </Text>
        <Text style={{ ...typography.metadata, color: colors.textSecondary }}>
          Comforting, simple, and ready in 20 min
        </Text>
      </PreviewCard>
    </View>
  );
}

type IntroSlide = {
  title: string;
  body: string;
  cta: string;
  backgroundColor: string;
  visual: ReactNode;
};

function IntroOnboardingLayout({
  slides,
  step,
  onStepChange,
  onSkip,
}: {
  slides: IntroSlide[];
  step: number;
  onStepChange: (step: number) => void;
  onSkip: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [pendingDirection, setPendingDirection] = useState<1 | -1 | null>(null);
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslate = useRef(new Animated.Value(0)).current;
  const progressOpacity = useRef(new Animated.Value(1)).current;
  const current = slides[step];
  // A compact device gets the content height it needs first; larger devices
  // settle at a spacious 64% visual region without changing per slide.
  const panelMinimum = 318 + insets.bottom;
  const visualHeight = Math.max(
    330,
    Math.min(Math.round(height * 0.64), height - panelMinimum),
  );

  useEffect(() => {
    let mounted = true;
    const updateReduceMotion = (enabled: boolean) => {
      if (mounted) setReduceMotion(enabled);
    };
    void AccessibilityInfo.isReduceMotionEnabled().then(updateReduceMotion);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      updateReduceMotion,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (pendingDirection === null) return;
    contentOpacity.setValue(0);
    progressOpacity.setValue(0);
    contentTranslate.setValue(pendingDirection * 12);
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslate, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(progressOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setPendingDirection(null);
      setTransitioning(false);
    });
  }, [
    contentOpacity,
    contentTranslate,
    pendingDirection,
    progressOpacity,
    step,
  ]);

  const move = (nextStep: number) => {
    if (transitioning || nextStep < 0 || nextStep > 3) return;
    const direction: 1 | -1 = nextStep > step ? 1 : -1;
    if (reduceMotion) {
      onStepChange(nextStep);
      return;
    }
    setTransitioning(true);
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslate, {
        toValue: direction * -12,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(progressOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) return;
      setPendingDirection(direction);
      onStepChange(nextStep);
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: current.backgroundColor }}>
      <StatusBar
        style={
          current.backgroundColor === colors.primarySoft ? "dark" : "light"
        }
      />
      <View
        style={{
          height: visualHeight,
          paddingTop: insets.top + spacing.sm,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.lg,
          backgroundColor: current.backgroundColor,
        }}
      >
        <View
          style={{
            minHeight: 44,
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <Pressable
            onPress={onSkip}
            hitSlop={10}
            accessibilityRole="button"
            style={{
              minWidth: 44,
              minHeight: 44,
              justifyContent: "center",
              alignItems: "flex-end",
            }}
          >
            <Text
              style={{
                ...typography.button,
                color:
                  current.backgroundColor === colors.primarySoft
                    ? colors.primaryDark
                    : colors.surface,
              }}
            >
              Skip
            </Text>
          </Pressable>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: spacing.sm,
          }}
        >
          <Animated.View
            style={{
              width: "100%",
              alignItems: "center",
              opacity: contentOpacity,
              transform: [{ translateX: contentTranslate }],
            }}
          >
            {current.visual}
          </Animated.View>
        </View>
      </View>
      <View
        style={{
          flex: 1,
          minHeight: panelMinimum,
          paddingTop: spacing.xl,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.sm,
          borderTopLeftRadius: radius.panel,
          backgroundColor: colors.surface,
        }}
      >
        <View style={{ paddingTop: spacing.xl }}>
          <Animated.View style={{ opacity: progressOpacity }}>
            <Progress step={step} />
          </Animated.View>
        </View>
        <Animated.View
          style={{
            minHeight: typography.screenTitle.lineHeight * 2,
            gap: spacing.sm,
            marginTop: spacing.xl,
            opacity: contentOpacity,
            transform: [{ translateX: contentTranslate }],
          }}
        >
          <Text style={{ ...typography.screenTitle, color: colors.text }}>
            {current.title}
          </Text>
        </Animated.View>
        <Animated.View
          style={{
            minHeight: typography.body.lineHeight * 2,
            marginTop: spacing.sm,
            opacity: contentOpacity,
            transform: [{ translateX: contentTranslate }],
          }}
        >
          <Text style={{ ...typography.body, color: colors.textSecondary }}>
            {current.body}
          </Text>
        </Animated.View>
        <View style={{ flex: 1, minHeight: spacing.sm }} />
        <View style={{ gap: spacing.sm }}>
          <PrimaryButton label={current.cta} onPress={() => move(step + 1)} />
          <Pressable
            onPress={() => move(step - 1)}
            disabled={step === 0 || transitioning}
            accessibilityRole="button"
            style={{
              minHeight: 44,
              justifyContent: "center",
              alignItems: "center",
              opacity: step === 0 ? 0 : 1,
            }}
          >
            <Text style={{ ...typography.button, color: colors.primaryDark }}>
              Back
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId, ensureAnonymousSession } = useSupabaseSession();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [diet, setDiet] = useState<string | null>(null);
  const [glutenFree, setGlutenFree] = useState(false);
  const [dairyFree, setDairyFree] = useState(false);
  const [selectedGoals, setGoals] = useState<string[]>([]);
  const [selectedAllergies, setAllergies] = useState<string[]>([]);
  const [selectedAvoids, setAvoids] = useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const toggle = (
    value: string,
    values: string[],
    set: (next: string[]) => void,
  ) =>
    set(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    );
  const complete = async (savePreferences: boolean) => {
    if (isCompleting) return;
    setIsCompleting(true);
    try {
      // Visitor drafts remain in component state. Only the completion action
      // crosses the persistence boundary and therefore requests an identity.
      const resolvedUserId = userId ?? (await ensureAnonymousSession()).userId;
      if (savePreferences) {
        const savedPreferences = await upsertPreferences(resolvedUserId, {
          ...defaultPreferences,
          dietPreferences: diet ? [diet] : [],
          baseDiet: diet ? legacyBaseDiet(diet) : null,
          glutenFree,
          dairyFree,
          nutritionGoals: selectedGoals,
          allergies: selectedAllergies,
          avoidedIngredients: selectedAvoids.map((value) => ({
            type: "custom" as const,
            value,
          })),
        });
        queryClient.setQueryData(
          queryKeys.preferences(resolvedUserId),
          savedPreferences,
        );
      }
      const completedProfile = await completeOnboarding(resolvedUserId);
      queryClient.setQueryData(
        queryKeys.profile(resolvedUserId),
        completedProfile,
      );
      await markDeviceOnboardingCompleted(resolvedUserId);
      router.replace("/(tabs)");
    } catch {
      Alert.alert(
        "Couldn’t finish onboarding",
        "Please check your connection and try again. Your progress has not been completed.",
      );
    } finally {
      setIsCompleting(false);
    }
  };
  const intro: IntroSlide[] = [
    {
      title: "Food first.\nDecision second.",
      body: "Turn ingredients you already have into meals you’ll actually want to cook.",
      visual: <WelcomeVisual />,
      backgroundColor: colors.primaryDark,
      cta: "Get Started",
    },
    {
      title: "Start with what you have.",
      body: "Add your ingredients and discover recipes you can make right now.",
      visual: <PantryVisual />,
      backgroundColor: colors.primarySoft,
      cta: "Next",
    },
    {
      title: "Meals that fit your mood.",
      body: "Find recipes that match your mood, available time, and food preferences.",
      visual: <MoodVisual />,
      backgroundColor: colors.primary,
      cta: "Continue",
    },
  ];
  const busy = isCompleting;
  if (step < 3)
    return (
      <IntroOnboardingLayout
        slides={intro}
        step={step}
        onStepChange={setStep}
        onSkip={() => setStep(3)}
      />
    );
  return (
    <View style={{ flex: 1, backgroundColor: colors.primaryDark }}>
      <StatusBar style="light" />
      <View style={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md }}>
        <View style={{ minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable onPress={() => setStep(2)} hitSlop={10} accessibilityRole="button" style={{ minWidth: 64, minHeight: 44, justifyContent: "center" }}><Text style={{ ...typography.button, color: colors.surface }}>‹ Back</Text></Pressable>
          <Text style={{ ...typography.metadata, color: colors.surface }}>Final step</Text>
        </View>
        <View style={{ gap: spacing.sm }}><Text style={{ ...typography.screenTitle, color: colors.surface }}>Make it yours.</Text><Text style={{ ...typography.body, color: colors.surface }}>A few quick choices to personalize your recipes.</Text></View>
      </View>
      <View style={{ flex: 1, borderTopLeftRadius: radius.panel, overflow: "hidden", backgroundColor: colors.surface }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.xl }}>
          <View style={{ gap: spacing.xl }}>
        <PreferenceSection title="Diet">
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}
          >
            {diets.map((item) => (
              <Choice
                key={item}
                label={item}
                selected={diet === item}
                onPress={() => setDiet(item)}
              />
            ))}
          </View>
        </PreferenceSection>
        <PreferenceSection title="Additional restrictions">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            <Choice label="Gluten-free" selected={glutenFree} onPress={() => setGlutenFree((value) => !value)} />
            <Choice label="Dairy-free" selected={dairyFree} onPress={() => setDairyFree((value) => !value)} />
          </View>
        </PreferenceSection>
        <PreferenceSection title="Nutrition goals">
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}
          >
            {goals.map((item) => (
              <Choice
                key={item}
                label={item}
                selected={selectedGoals.includes(item)}
                onPress={() => toggle(item, selectedGoals, setGoals)}
              />
            ))}
          </View>
        </PreferenceSection>
        <PreferenceSection title="Allergies">
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}
          >
            {allergies.map((item) => (
              <Choice
                key={item}
                label={item}
                selected={selectedAllergies.includes(item)}
                onPress={() => toggle(item, selectedAllergies, setAllergies)}
              />
            ))}
          </View>
        </PreferenceSection>
        <PreferenceSection title="Avoid ingredients">
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}
          >
            {avoids.map((item) => (
              <Choice
                key={item}
                label={item}
                selected={selectedAvoids.includes(item)}
                onPress={() => toggle(item, selectedAvoids, setAvoids)}
              />
            ))}
          </View>
        </PreferenceSection>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: spacing.sm,
            padding: spacing.md,
            borderRadius: radius.md,
            backgroundColor: colors.primarySoft,
          }}
        >
          <Info size={18} color={colors.primaryDark} style={{ marginTop: 1 }} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ ...typography.metadata, color: colors.primaryDark }}>
              You can always change these.
            </Text>
            <Text style={{ ...typography.caption, color: colors.primaryDark }}>
              Find all options in Profile → Food Preferences.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: insets.bottom + spacing.sm, gap: spacing.sm, backgroundColor: colors.surface }}>
      <PrimaryButton label={busy ? "Saving…" : "Save and Continue"} disabled={busy} onPress={() => complete(true)} />
      <Pressable disabled={busy} onPress={() => complete(false)} accessibilityRole="button" style={{ minHeight: 44, justifyContent: "center", alignItems: "center", opacity: busy ? 0.45 : 1 }}><Text style={{ ...typography.button, color: colors.primaryDark }}>Skip for now</Text></Pressable>
    </View>
      </View>
    </View>
  );
}

function PreferenceSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={{ gap: spacing.md }}>
      <Text style={{ ...typography.cardTitle, color: colors.text }}>
        {title}
      </Text>
      {children}
    </View>
  );
}
