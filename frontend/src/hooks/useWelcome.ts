import { useCallback } from "react";
import { router } from "expo-router";
import { useIsDarkMode, useThemeActions } from "@stores/useThemeStore";

export const useWelcome = () => {
  const isDarkMode = useIsDarkMode();
  const { toggleTheme } = useThemeActions();

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
