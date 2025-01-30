import React, { useEffect } from "react";
import { Appearance } from "react-native";
import useThemeStore from "@stores/useThemeStore";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { initializeTheme, setManualMode } = useThemeStore();

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // Listen for system theme changes when not in manual mode
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setManualMode(false);
    });

    return () => {
      subscription.remove();
    };
  }, [setManualMode]);

  return <>{children}</>;
};

export default ThemeProvider;
