import React from 'react';
import { Stack } from 'expo-router';
import { createTheme } from '@src/styles/theme';
import { useIsDarkMode } from '@stores/useThemeStore';

/**
 * Layout for authentication screens
 * This is used for all screens within the auth group
 */

const AUTH_SCREENS = [
  {
    name: 'index',
    title: 'Welcome to Lithuaningo',
  },
  {
    name: 'login',
    title: 'Login',
  },
  {
    name: 'signup',
    title: 'Signup',
  },
  {
    name: 'forgot-password',
    title: 'Forgot Password',
  },
  {
    name: 'email-verification',
    title: 'Email Verification',
  },
  {
    name: 'password-reset-verification',
    title: 'Password Reset Verification',
  },
];

export default function AuthLayout() {
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
          fontSize: 20,
          fontWeight: 'bold',
        },
        headerTintColor: theme.colors.primary,
        animation: 'none',
      }}
    >
      {AUTH_SCREENS.map((screen) => (
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
