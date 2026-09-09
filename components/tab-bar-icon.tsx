import {
  CookingPot,
  Heart,
  House,
  LucideIcon,
  UserRound,
} from "lucide-react-native";
import { StyleSheet, View } from "react-native";

const icons = {
  home: House,
  pantry: CookingPot,
  saved: Heart,
  profile: UserRound,
} satisfies Record<string, LucideIcon>;

export function TabBarIcon({
  name,
  focused,
}: {
  name: keyof typeof icons;
  focused: boolean;
}) {
  const Icon = icons[name];
  return (
    <View style={[styles.icon, focused && styles.focused]}>
      <Icon color={focused ? "#FFFFFF" : "#687069"} size={21} strokeWidth={2} />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
  },
  focused: { backgroundColor: "#3F6B4F" },
});
