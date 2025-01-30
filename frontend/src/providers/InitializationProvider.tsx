import React, { useEffect } from "react";
import { Appearance } from "react-native";
import useThemeStore from "@stores/useThemeStore";
import { useAppInfoActions } from "@stores/useAppInfoStore";

/**
 * Provider component that handles core app initialization:
 * - Theme initialization and system theme changes
 * - App info and version checks
 */
const InitializationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { initializeTheme, setManualMode } = useThemeStore();
  const { checkAppStatus } = useAppInfoActions();

  // Initialize theme and app info on mount
  useEffect(() => {
    initializeTheme();
    checkAppStatus();
  }, [initializeTheme, checkAppStatus]);

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

export default InitializationProvider;
