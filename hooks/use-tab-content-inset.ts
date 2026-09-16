import { useBottomTabBarHeight } from "expo-router/build/react-navigation/bottom-tabs";

// The custom floating bar reports its measured height to Expo Router. Replace
// each screen's baseline bottom padding with that one authoritative clearance.
export function useTabContentInset(basePadding: number) {
  const tabBarHeight = useBottomTabBarHeight();
  return Math.max(basePadding, tabBarHeight + 12);
}
