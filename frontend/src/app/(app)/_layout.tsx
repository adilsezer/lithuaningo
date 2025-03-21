import React from "react";
import { Stack } from "expo-router";
import { createTheme } from "@src/styles/theme";
import { useIsDarkMode } from "@stores/useThemeStore";

/**
 * Layout for authenticated screens
 * This is used for all screens within the (app) group
 */
export default function AppLayout() {
  const isDarkMode = useIsDarkMode();
  const theme = createTheme(isDarkMode);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Stack.Screen
        name="profile/index"
        options={{
          title: "Profile",
        }}
      />
      <Stack.Screen
        name="profile/edit-profile"
        options={{
          title: "Edit Profile",
        }}
      />
      <Stack.Screen
        name="profile/settings"
        options={{
          title: "Settings",
        }}
      />
      {/* Add other authenticated screens here */}
    </Stack>
  );
}
