import React, { useEffect } from "react";
import { Appearance, Platform } from "react-native";
import useThemeStore from "@stores/useThemeStore";
import useAppInfoStore from "@stores/useAppInfoStore";
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
  const { checkAppStatus, appInfo, isCheckingStatus } = useAppInfoStore();
  const userData = useUserData();

  // Initialize theme and app info on mount
  useEffect(() => {
    try {
      initializeTheme();

      // Only check app status if it hasn't been checked yet
      if (!appInfo && !isCheckingStatus) {
        checkAppStatus();
      }
    } catch (error) {
      console.error("Initialization error:", error);
    }
  }, [initializeTheme, checkAppStatus, appInfo, isCheckingStatus]);

  // Initialize RevenueCat
  useEffect(() => {
    const initializeRevenueCat = async () => {
      try {
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
          await Purchases.logIn(userData.id);
        }
      } catch (error) {
        console.error("RevenueCat initialization error:", error);
      }
    };

    initializeRevenueCat();
  }, [userData?.id]);

  // Listen for system theme changes when not in manual mode
  useEffect(() => {
    try {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        setManualMode(false);
      });

      return () => {
        subscription.remove();
      };
    } catch (error) {
      console.error("Theme listener error:", error);
    }
  }, [setManualMode]);

  return <>{children}</>;
};

export default InitializationProvider;
