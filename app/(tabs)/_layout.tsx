import { Tabs } from "expo-router";
import { TabBarIcon } from "@/components/tab-bar-icon";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3F6B4F",
        tabBarInactiveTintColor: "#687069",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#DDE3DC",
          borderTopWidth: 1,
          paddingTop: 7,
        },
        tabBarItemStyle: { minHeight: 48 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="pantry"
        options={{
          title: "Pantry",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="pantry" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="saved" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
