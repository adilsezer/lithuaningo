import { MD3LightTheme } from "react-native-paper";
import {
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from "@react-navigation/native";
import { adaptNavigationTheme } from "react-native-paper";

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

export type ThemeColors = {
  primary: string;
  secondary: string;
  tertiary: string;
  background: string;
  onBackground: string;
  text: string;
  link: string;
  placeholder: string;
  border: string;
  success: string;
  error: string;
  surface: string;
  onSurface: string;
  onSurfaceVariant: string;
  primaryContainer: string;
  secondaryContainer: string;
  onPrimaryContainer: string;
  onSecondaryContainer: string;
};

export const lightThemeColors: ThemeColors = {
  primary: "#66BB6A",
  secondary: "#FFC107",
  tertiary: "#d5304f",
  background: "#FFFFFF",
  onBackground: "#2E3B44",
  text: "#2E3B44",
  link: "#1E88E5",
  placeholder: "#9E9E9E",
  border: "#B0BEC5",
  success: "#66BB6A",
  error: "#d5304f",
  surface: "#f0f0f0",
  onSurface: "#2E3B44",
  onSurfaceVariant: "#607D8B",
  primaryContainer: "#d3f8d3",
  onPrimaryContainer: "#2E3B44",
  secondaryContainer: "#d3f8d3",
  onSecondaryContainer: "#2E3B44",
};

export const darkThemeColors: ThemeColors = {
  primary: "#66BB6A",
  secondary: "#FFB300",
  tertiary: "#d5304f",
  background: "#263238",
  onBackground: "#FAFAFA",
  text: "#FAFAFA",
  link: "#82CAFF",
  placeholder: "#607D8B",
  border: "#37474F",
  success: "#66BB6A",
  error: "#d5304f",
  surface: "#37474F",
  onSurface: "#FAFAFA",
  onSurfaceVariant: "#B0BEC5",
  primaryContainer: "#d3f8d3",
  onPrimaryContainer: "#263238",
  secondaryContainer: "#d3f8d3",
  onSecondaryContainer: "#263238",
};

export const createTheme = (isDarkMode: boolean) => {
  const colors = isDarkMode ? darkThemeColors : lightThemeColors;
  const paperTheme = {
    ...MD3LightTheme,
    version: 3 as const,
  };
  const navigationTheme = isDarkMode ? DarkTheme : LightTheme;

  return {
    ...paperTheme,
    ...navigationTheme,
    colors: {
      ...paperTheme.colors,
      ...navigationTheme.colors,
      primary: colors.primary,
      primaryContainer: colors.primaryContainer,
      secondaryContainer: colors.secondaryContainer,
      onPrimaryContainer: colors.onPrimaryContainer,
      onSecondaryContainer: colors.onSecondaryContainer,
      secondary: colors.secondary,
      tertiary: colors.tertiary,
      error: colors.error,
      background: colors.background,
      onBackground: colors.onBackground,
      surface: colors.surface,
      onSurface: colors.onSurface,
      onSurfaceVariant: colors.onSurfaceVariant,
      placeholder: colors.placeholder,
    },
    fonts: {
      ...MD3LightTheme.fonts,
    },
  };
};

export default {
  createTheme,
  lightThemeColors,
  darkThemeColors,
};
