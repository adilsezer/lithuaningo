import React from "react";
import { Stack, Redirect } from "expo-router";
import { useIsAdmin } from "@stores/useUserStore";
import { useTheme } from "react-native-paper";

const ADMIN_SCREENS = [
  { name: "flashcard-review", title: "Review Flashcards" },
  // Add future admin screens here
];

export default function AdminLayout() {
  const isAdmin = useIsAdmin();
  const theme = useTheme();

  // If the user is not an admin, redirect them away from the admin section.
  if (!isAdmin) {
    // You can redirect to the home screen or a specific "access denied" screen.
    // For now, redirecting to the main app stack.
    return <Redirect href="/(app)" />;
  }

  // This layout can contain navigation configuration like screen titles.
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        headerShown: false,
        animation: "none",
      }}
    >
      {ADMIN_SCREENS.map((screen) => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          options={{ title: screen.title }}
        />
      ))}
    </Stack>
  );
}
