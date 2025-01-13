import { useCallback } from "react";
import { router } from "expo-router";
import { useTheme } from "@src/context/ThemeContext";

export const useWelcome = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const navigateToAuth = useCallback((route: "login" | "signup") => {
    router.push(`/auth/${route}`);
  }, []);

  return {
    // Theme
    isDarkMode,
    toggleTheme,

    // Navigation
    navigateToAuth,
  };
};
