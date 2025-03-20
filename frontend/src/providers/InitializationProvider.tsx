import React, { useEffect } from "react";
import { Appearance, Platform } from "react-native";
import useThemeStore from "@stores/useThemeStore";
import { useAppInfoActions } from "@stores/useAppInfoStore";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { useUserData } from "@stores/useUserStore";
import { REVENUECAT_API_KEYS, DEBUG_SETTINGS } from "@config/revenuecat.config";

/**
 * Provider component that handles core app initialization:
 * - Theme initialization and system theme changes
 * - App info and version checks
 * - RevenueCat initialization
 */
const InitializationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { initializeTheme, setManualMode } = useThemeStore();
  const { checkAppStatus } = useAppInfoActions();
  const userData = useUserData();

  // Initialize theme and app info on mount
  useEffect(() => {
    initializeTheme();
    checkAppStatus();
  }, [initializeTheme, checkAppStatus]);

  // Initialize RevenueCat
  useEffect(() => {
    const initializeRevenueCat = async () => {
      // Set RevenueCat log level (use LOG_LEVEL.ERROR in production)
      Purchases.setLogLevel(
        DEBUG_SETTINGS.enableDebugLogs ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR
      );

      // Configure RevenueCat with the appropriate API key
      if (Platform.OS === "ios") {
        await Purchases.configure({ apiKey: REVENUECAT_API_KEYS.ios });
      } else if (Platform.OS === "android") {
        await Purchases.configure({ apiKey: REVENUECAT_API_KEYS.android });
      }

      // Log in the user if they're authenticated
      if (userData?.id) {
        try {
          await Purchases.logIn(userData.id);
          console.log("RevenueCat: User logged in", userData.id);
        } catch (error) {
          console.error("RevenueCat: Failed to log in user", error);
        }
      }
    };

    initializeRevenueCat();
  }, [userData?.id]);

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
