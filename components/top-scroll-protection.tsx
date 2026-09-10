import { LinearGradient } from "expo-linear-gradient";
import { Animated, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme";

type TopScrollProtectionProps = {
  backgroundColor?: string;
  fadeDistance?: number;
  scrollY?: Animated.Value;
};

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const DEFAULT_FADE_DISTANCE = 32;

function rgba(color: string, alpha: number) {
  const hex = color.replace("#", "");
  const normalized =
    hex.length === 3
      ? hex
          .split("")
          .map((channel) => channel + channel)
          .join("")
      : hex;
  const matches = /^[0-9a-fA-F]{6}$/.test(normalized);

  if (!matches) return color;

  const value = Number.parseInt(normalized, 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}

/**
 * A non-layout overlay that lets edge-to-edge scroll content dissolve under
 * the system chrome instead of competing with the status-bar icons. It uses
 * one continuous gradient, derived from the surface behind the status bar.
 */
export function TopScrollProtection({
  backgroundColor = colors.background,
  fadeDistance = DEFAULT_FADE_DISTANCE,
  scrollY,
}: TopScrollProtectionProps) {
  const insets = useSafeAreaInsets();
  const opacity = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 12],
        outputRange: [0, 1],
        extrapolate: "clamp",
      })
    : 1;
  const height = Math.round(insets.top + fadeDistance);

  return (
    <AnimatedLinearGradient
      pointerEvents="none"
      style={[
        styles.protection,
        { height, opacity },
      ]}
      colors={[
        rgba(backgroundColor, 1),
        rgba(backgroundColor, 0.72),
        rgba(backgroundColor, 0),
      ]}
      locations={[0, 0.55, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    />
  );
}

const styles = StyleSheet.create({
  protection: {
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1,
  },
});
