import React from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Dimensions, Platform, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
/**
 * Layout for authenticated screens
 * This is used for all screens within the (app) group
 */

const { width } = Dimensions.get("window");
const isTablet = (Platform.OS === "ios" && Platform.isPad) || width >= 768;

const TAB_ITEMS = [
  { name: "index", title: "Home", icon: "home" },
  { name: "flashcard", title: "Flashcard", icon: "cards" },
  { name: "challenge", title: "Challenge", icon: "pencil" },
  { name: "chat", title: "Chat", icon: "robot" },
  { name: "profile", title: "Profile", icon: "account" },
] as const;
export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarStyle: styles.tabBarStyle,
        tabBarLabelStyle: {
          fontSize: isTablet ? 20 : 10,
        },
        sceneStyle: {
          backgroundColor: "transparent",
          flex: 1,
        },
      }}
      initialRouteName="index"
      backBehavior="history"
    >
      {TAB_ITEMS.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons size={28} name={icon} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    height: 60,
    paddingTop: 10,
    paddingBottom: 10,
    elevation: 0,
    backgroundColor: "transparent",
  },
  tabLabel: {
    fontSize: 14,
  },
});
