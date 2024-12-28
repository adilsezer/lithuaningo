import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { Dimensions, Platform, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");
const isTablet = (Platform.OS === "ios" && Platform.isPad) || width >= 768;

// Define tab items configuration
const TAB_ITEMS = [
  { name: "index", title: "Home", icon: "home" },
  { name: "learn", title: "Learn", icon: "play-circle" },
  { name: "leaderboard", title: "Leaderboard", icon: "trophy" },
  { name: "profile", title: "Profile", icon: "user" },
] as const;

export default function TabLayout() {
  const { colors } = useThemeStyles();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.active,
        tabBarStyle: styles.tabBarStyle,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: isTablet ? 20 : 10,
        },
        sceneStyle: {
          backgroundColor: "transparent",
          flex: 1,
        },
      }}
    >
      {TAB_ITEMS.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name={icon} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    height: 70,
    paddingTop: 10,
    paddingBottom: 0,
    elevation: 0,
    backgroundColor: "transparent",
  },
  tabLabel: {
    fontSize: 14,
  },
});
