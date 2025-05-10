import React, { useEffect } from "react";
import { Appearance, Platform } from "react-native";
import useThemeStore from "@stores/useThemeStore";
import useAppInfoStore from "@stores/useAppInfoStore";
import { useUserData } from "@stores/useUserStore";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { REVENUECAT_API_KEYS, DEBUG_SETTINGS } from "@config/revenuecat.config";

/**
 * Provider component that handles core app initialization:
 * - Theme initialization and system theme changes
 * - App info and version checks
 * - User data handling
 * - RevenueCat initialization
 */
const InitializationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { initializeTheme, setManualMode } = useThemeStore();
  const { checkAppStatus, appInfo, isCheckingStatus, hasFailedCheck } =
    useAppInfoStore();
  const userData = useUserData();

  // Initialize theme and app info on mount
  useEffect(() => {
    try {
      initializeTheme();

      // Only check app status if it hasn't been checked yet and hasn't failed
      if (!appInfo && !isCheckingStatus && !hasFailedCheck) {
        checkAppStatus();
      }
    } catch (error) {
      console.error("Initialization error:", error);
    }
  }, [
    initializeTheme,
    checkAppStatus,
    appInfo,
    isCheckingStatus,
    hasFailedCheck,
  ]);

  // Initialize RevenueCat
  useEffect(() => {
    const initializeRevenueCat = async () => {
      try {
        // Set log level based on debug settings
        Purchases.setLogLevel(
          DEBUG_SETTINGS.enableDebugLogs ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR
        );

        // Base configuration options shared between platforms
        const configOptions = {
          shouldShowInAppMessagesAutomatically: true,
          // Set observer mode to false - we need full access
          observerMode: false,
        };

        // Configure based on platform
        if (Platform.OS === "ios") {
          await Purchases.configure({
            apiKey: REVENUECAT_API_KEYS.ios,
            ...configOptions,
          });
        } else if (Platform.OS === "android") {
          await Purchases.configure({
            apiKey: REVENUECAT_API_KEYS.android,
            ...configOptions,
          });
        }

        console.log("RevenueCat initialized successfully");
      } catch (error) {
        // Log detailed error but don't surface to UI since this is initialization
        console.error("Failed to initialize RevenueCat:", error);
      }
    };

    initializeRevenueCat();
  }, []);

  // Identify user with RevenueCat when user data changes
  useEffect(() => {
    // Only attempt to identify if we have a valid user ID
    if (!userData?.id) return;

    const identifyUser = async () => {
      try {
        await Purchases.logIn(userData.id);
        console.log("RevenueCat user identified:", userData.id);
      } catch (error) {
        console.error("Failed to identify user with RevenueCat:", error);
      }
    };

    identifyUser();
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
