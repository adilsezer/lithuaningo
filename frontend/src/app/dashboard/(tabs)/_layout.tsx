import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { Dimensions, Platform, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");
const isTablet = (Platform.OS === "ios" && Platform.isPad) || width >= 768;

export default function TabLayout() {
  const { colors: globalColors } = useThemeStyles();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: globalColors.active,
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
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="play-circle" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="trophy" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user" color={color} />
          ),
        }}
      />
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
