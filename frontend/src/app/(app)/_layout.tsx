import React from "react";
import { Stack } from "expo-router";
import { createTheme } from "@src/styles/theme";
import { useIsDarkMode } from "@stores/useThemeStore";

/**
 * Layout for authenticated screens
 * This is used for all screens within the (app) group
 */

const AUTHENTICATED_SCREENS = [
  { name: "profile/edit-profile", title: "Edit Profile" },
  { name: "profile/settings", title: "Settings" },
  { name: "profile/change-password", title: "Change Password" },
  { name: "profile/delete-account", title: "Delete Account" },
  { name: "premium/index", title: "Premium Membership" },
  { name: "about/index", title: "About" },
  { name: "terms-of-service/index", title: "Terms of Service" },
  { name: "privacy-policy/index", title: "Privacy Policy" },
  { name: "flashcard/[id]", title: "Flashcards" },
  { name: "daily-challenge/index", title: "Daily Challenge" },
];

export default function AppLayout() {
  const isDarkMode = useIsDarkMode();
  const theme = createTheme(isDarkMode);

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: theme.colors.background,
          paddingVertical: 12,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTitleStyle: {
          fontFamily: theme.fonts.default.fontFamily,
          color: theme.colors.onSurface,
        },
        headerTintColor: theme.colors.primary,
        animation: "none",
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      {AUTHENTICATED_SCREENS.map((screen) => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: screen.title,
          }}
        />
      ))}
    </Stack>
  );
}
