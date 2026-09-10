import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { AnimatedTabBar } from "@/components/animated-tab-bar";

// React Navigation invokes `tabBar` as a callback, so this must return JSX
// instead of passing the hook-using component directly. Keeping it at module
// scope also prevents a new callback identity on every layout render.
const renderTabBar = (props: ComponentProps<typeof AnimatedTabBar>) => (
  <AnimatedTabBar {...props} />
);

export default function TabLayout() {
  return (
    <Tabs
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3F6B4F",
        tabBarInactiveTintColor: "#687069",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="pantry"
        options={{
          title: "Pantry",
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
