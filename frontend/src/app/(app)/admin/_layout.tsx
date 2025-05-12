import React from "react";
import { Stack, Redirect } from "expo-router";
import { useIsAdmin } from "@stores/useUserStore";

export default function AdminLayout() {
  const isAdmin = useIsAdmin();

  // If the user is not an admin, redirect them away from the admin section.
  if (!isAdmin) {
    // You can redirect to the home screen or a specific "access denied" screen.
    // For now, redirecting to the main app stack.
    return <Redirect href="/(app)" />;
  }

  // This layout can contain navigation configuration like screen titles.
  return (
    <Stack>
      <Stack.Screen
        name="flashcard-review"
        options={{ title: "Review Flashcards" }}
      />
      {/* Add other admin screens here if needed */}
    </Stack>
  );
}
