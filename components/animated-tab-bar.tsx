import {
  type ComponentType,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import type { LucideProps } from "lucide-react-native";
import { CookingPot, Heart, House, UserRound } from "lucide-react-native";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";

const tabs = {
  index: { label: "Home", icon: House },
  pantry: { label: "Pantry", icon: CookingPot },
  saved: { label: "Saved", icon: Heart },
  profile: { label: "Profile", icon: UserRound },
} satisfies Record<string, { label: string; icon: ComponentType<LucideProps> }>;

const ACTIVE_TINT = "#3F6B4F";
const INACTIVE_TINT = "#687069";

export function AnimatedTabBar({
  state,
  descriptors,
  navigation,
  insets,
}: BottomTabBarProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const updateReduceMotion = (enabled: boolean) => {
      if (isMounted) setReduceMotion(enabled);
    };

    void AccessibilityInfo.isReduceMotionEnabled().then(updateReduceMotion);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      updateReduceMotion,
    );
    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 7) }]}>
      {state.routes.map((route, index) => {
        const tab = tabs[route.name as keyof typeof tabs];
        if (!tab) return null;

        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        return (
          <TabButton
            key={route.key}
            icon={tab.icon}
            isFocused={isFocused}
            label={
              typeof options.tabBarLabel === "string"
                ? options.tabBarLabel
                : (options.title ?? tab.label)
            }
            reduceMotion={reduceMotion}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? tab.label}
            testID={options.tabBarButtonTestID}
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            onLongPress={() =>
              navigation.emit({ type: "tabLongPress", target: route.key })
            }
          />
        );
      })}
    </View>
  );
}

type TabButtonProps = {
  accessibilityLabel: string;
  icon: ComponentType<LucideProps>;
  isFocused: boolean;
  label: string;
  reduceMotion: boolean;
  testID?: string;
  onLongPress: () => void;
  onPress: () => void;
};

function TabButton({
  accessibilityLabel,
  icon: Icon,
  isFocused,
  label,
  reduceMotion,
  testID,
  onLongPress,
  onPress,
}: TabButtonProps) {
  // These values are created once for the lifetime of a tab button. Focus only
  // changes their value; it never swaps the icon, label, or background tree.
  const activeProgress = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const press = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    activeProgress.stopAnimation();
    // A tab navigation can happen before Pressable delivers onPressOut. Reset
    // the separate press channel so it cannot leave a stale pressed transform.
    press.stopAnimation();
    press.setValue(0);

    if (reduceMotion) {
      activeProgress.setValue(isFocused ? 1 : 0);
      return;
    }

    Animated.timing(activeProgress, {
      toValue: isFocused ? 1 : 0,
      duration: 160,
      useNativeDriver: true,
    }).start();

    return () => {
      activeProgress.stopAnimation();
      press.stopAnimation();
    };
  }, [activeProgress, isFocused, press, reduceMotion]);

  const animatePress = (pressed: boolean) => {
    press.stopAnimation();
    if (reduceMotion) {
      press.setValue(0);
      return;
    }

    if (pressed) {
      Animated.timing(press, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.spring(press, {
      toValue: 0,
      damping: 28,
      stiffness: 360,
      mass: 0.55,
      useNativeDriver: true,
    }).start();
  };

  const selectionScale = activeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });
  const pressScale = press.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.94],
  });
  const tint = isFocused ? ACTIVE_TINT : INACTIVE_TINT;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      hitSlop={4}
      onLongPress={onLongPress}
      onPress={onPress}
      onPressIn={() => animatePress(true)}
      onPressOut={() => animatePress(false)}
      style={styles.button}
      testID={testID}
    >
      <Animated.View
        style={[
          styles.content,
          { transform: [{ scale: pressScale }] },
        ]}
      >
        <Animated.View style={styles.iconContainer}>
          <Animated.View
            pointerEvents="none"
            style={[styles.activeBackground, { opacity: activeProgress }]}
          />
          <Animated.View style={{ transform: [{ scale: selectionScale }] }}>
            <Icon color={tint} size={21} strokeWidth={2} />
          </Animated.View>
        </Animated.View>
        <Animated.Text style={[styles.label, { color: tint }]}>{label}</Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderTopColor: "#DDE3DC",
    borderTopWidth: 1,
    flexDirection: "row",
    minHeight: 64,
    paddingTop: 7,
  },
  button: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 56,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    borderRadius: 13,
    height: 32,
    justifyContent: "center",
    overflow: "hidden",
    width: 40,
  },
  activeBackground: {
    backgroundColor: "#E8F2EA",
    borderRadius: 13,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  label: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 1,
  },
});
