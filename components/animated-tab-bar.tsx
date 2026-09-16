import { type ComponentType, useContext } from "react";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import type { LucideProps } from "lucide-react-native";
import { Bookmark, CookingPot, House, UserRound } from "lucide-react-native";
import {
  BottomTabBarHeightCallbackContext,
  type BottomTabBarProps,
} from "expo-router/build/react-navigation/bottom-tabs";

const tabs = {
  index: { label: "Home", icon: House },
  pantry: { label: "Pantry", icon: CookingPot },
  saved: { label: "Saved", icon: Bookmark },
  profile: { label: "Profile", icon: UserRound },
} satisfies Record<string, { label: string; icon: ComponentType<LucideProps> }>;

const ACTIVE_TINT = "#FFFFFF";
const INACTIVE_TINT = "#E8F2EA";
export function AnimatedTabBar({
  state,
  descriptors,
  navigation,
  insets,
}: BottomTabBarProps) {
  const onHeightChange = useContext(BottomTabBarHeightCallbackContext);
  const onBarLayout = ({ nativeEvent }: { nativeEvent: { layout: { height: number } } }) => {
    onHeightChange?.(nativeEvent.layout.height);
  };

  return (
    <View
      onLayout={onBarLayout}
      pointerEvents="box-none"
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}
    >
      <View style={styles.pill}>
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
    </View>
  );
}

type TabButtonProps = {
  accessibilityLabel: string;
  icon: ComponentType<LucideProps>;
  isFocused: boolean;
  testID?: string;
  onLongPress: () => void;
  onPress: () => void;
};

function TabButton({
  accessibilityLabel,
  icon: Icon,
  isFocused,
  testID,
  onLongPress,
  onPress,
}: TabButtonProps) {
  const tint = isFocused ? ACTIVE_TINT : INACTIVE_TINT;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      hitSlop={4}
      onLongPress={onLongPress}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      testID={testID}
    >
      <View style={styles.content}>
        <View style={styles.iconSlot}>
          <Icon color={tint} size={24} strokeWidth={2} />
        </View>
        <View
          pointerEvents="none"
          style={[styles.activeIndicator, !isFocused && styles.hiddenIndicator]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    bottom: 0,
    left: 0,
    position: "absolute",
    paddingHorizontal: 16,
    paddingTop: 8,
    right: 0,
    zIndex: 1,
  },
  pill: {
    backgroundColor: "#294936",
    borderRadius: 20,
    elevation: 1,
    flexDirection: "row",
    height: 56,
    overflow: "hidden",
    shadowColor: "#172019",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  button: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 56,
  },
  buttonPressed: { transform: [{ scale: 0.98 }] },
  content: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
  },
  iconSlot: {
    alignItems: "center",
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  activeIndicator: {
    backgroundColor: "#E8B86A",
    borderRadius: 2,
    bottom: 4,
    height: 3,
    position: "absolute",
    width: 18,
  },
  hiddenIndicator: { opacity: 0 },
});
