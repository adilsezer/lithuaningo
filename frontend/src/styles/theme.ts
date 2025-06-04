import { MD3LightTheme, adaptNavigationTheme } from "react-native-paper";
import {
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from "@react-navigation/native";

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

export interface ThemeColors {
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
  onSurfaceDisabled: string;
}

export const lightThemeColors: ThemeColors = {
  primary: "#66BB6A",
  secondary: "#FFC107",
  tertiary: "#d5304f",
  background: "#FFFFFF",
  onBackground: "#263238",
  text: "#263238",
  link: "#1976D2",
  placeholder: "#78909C",
  border: "#CFD8DC",
  success: "#4CAF50",
  error: "#F44336",
  surface: "#F5F5F5",
  onSurface: "#263238",
  onSurfaceVariant: "#546E7A",
  primaryContainer: "#E8F5E9",
  onPrimaryContainer: "#1B5E20",
  secondaryContainer: "#FFF8E1",
  onSecondaryContainer: "#37474F",
  onSurfaceDisabled: "#B0BEC5",
};

export const darkThemeColors: ThemeColors = {
  primary: "#66BB6A",
  secondary: "#FFB300",
  tertiary: "#d5304f",
  background: "#263238",
  onBackground: "#ECEFF1",
  text: "#ECEFF1",
  link: "#64B5F6",
  placeholder: "#B0BEC5",
  border: "#455A64",
  success: "#81C784",
  error: "#EF5350",
  surface: "#37474F",
  onSurface: "#ECEFF1",
  onSurfaceVariant: "#CFD8DC",
  primaryContainer: "#388E3C",
  onPrimaryContainer: "#E8F5E9",
  secondaryContainer: "#FF8F00",
  onSecondaryContainer: "#FFF8E1",
  onSurfaceDisabled: "#B0BEC5",
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
      onSurfaceDisabled: colors.onSurfaceDisabled,
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
