import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { View, StyleSheet } from "react-native";

export default function TabLayout() {
  const { colors: globalColors } = useThemeStyles();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: globalColors.active,
        tabBarStyle: styles.tabBarStyle,
        headerShown: false,
      }}
      sceneContainerStyle={{
        backgroundColor: "transparent",
        flex: 1,
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
    elevation: 0, // Remove shadow on Android
  },
});
