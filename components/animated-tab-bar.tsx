import { type ComponentType, useEffect, useRef, useState } from "react";
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
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => subscription.remove();
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
  const selection = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const press = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    selection.stopAnimation();
    if (reduceMotion) {
      selection.setValue(isFocused ? 1 : 0);
      return;
    }

    Animated.timing(selection, {
      toValue: isFocused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isFocused, reduceMotion, selection]);

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

  const tint = selection.interpolate({
    inputRange: [0, 1],
    outputRange: [INACTIVE_TINT, ACTIVE_TINT],
  });
  const selectionScale = selection.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });
  const pressScale = press.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.94],
  });
  const opacity = press.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.8],
  });
  const backgroundColor = selection.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", "#E8F2EA"],
  });
  const AnimatedIcon = Animated.createAnimatedComponent(Icon);

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
          { opacity, transform: [{ scale: pressScale }] },
        ]}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            { backgroundColor, transform: [{ scale: selectionScale }] },
          ]}
        >
          <AnimatedIcon color={tint} size={21} strokeWidth={2} />
        </Animated.View>
        <Animated.Text style={[styles.label, { color: tint }]}>
          {label}
        </Animated.Text>
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
    width: 40,
  },
  label: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 1,
  },
});
