import React from "react";
import { Stack } from "expo-router";
import { createTheme } from "@src/styles/theme";
import { useIsDarkMode } from "@stores/useThemeStore";

/**
 * Layout for authentication screens
 * This is used for all screens within the auth group
 */
export default function AuthLayout() {
  const isDarkMode = useIsDarkMode();
  const theme = createTheme(isDarkMode);

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTitleStyle: {
          fontFamily: theme.fonts.default.fontFamily,
          color: theme.colors.onSurface,
          fontSize: 20,
          fontWeight: "bold",
        },
        headerTintColor: theme.colors.primary,
        animation: "none",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Welcome",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
        }}
      />
      <Stack.Screen name="signup" options={{ title: "Signup" }} />
      <Stack.Screen
        name="forgot-password"
        options={{ title: "Forgot Password" }}
      />
      <Stack.Screen
        name="email-verification"
        options={{ title: "Email Verification" }}
      />
      <Stack.Screen
        name="password-reset-verification"
        options={{ title: "Password Reset Verification" }}
      />
    </Stack>
  );
}
