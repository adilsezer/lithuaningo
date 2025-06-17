import React, { useEffect } from "react";
import { Appearance, Platform } from "react-native";
import useThemeStore from "@stores/useThemeStore";
import useAppInfoStore from "@stores/useAppInfoStore";
import { useUserData, useUserStore } from "@stores/useUserStore";
import Purchases, { LOG_LEVEL, CustomerInfo } from "react-native-purchases";
import { REVENUECAT_API_KEYS, DEBUG_SETTINGS } from "@config/revenuecat.config";
import { useSetLoading } from "@stores/useUIStore";
import RevenueCatService from "@services/subscription/revenueCatService";

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
  const setLoading = useSetLoading();

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
        setLoading(true);

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
          if (!REVENUECAT_API_KEYS.ios) {
            console.warn(
              "RevenueCat iOS API key is missing. Skipping initialization."
            );
            return;
          }
          await Purchases.configure({
            apiKey: REVENUECAT_API_KEYS.ios,
            ...configOptions,
          });
        } else if (Platform.OS === "android") {
          if (!REVENUECAT_API_KEYS.android) {
            console.warn(
              "RevenueCat Android API key is missing. Skipping initialization."
            );
            return;
          }
          await Purchases.configure({
            apiKey: REVENUECAT_API_KEYS.android,
            ...configOptions,
          });
        }

        console.log("RevenueCat initialized successfully");
      } catch (error) {
        // Log detailed error but don't surface to UI since this is initialization
        console.error("Failed to initialize RevenueCat:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeRevenueCat();
  }, [setLoading]);

  // Identify user with RevenueCat when user data changes
  useEffect(() => {
    // Only attempt to identify if we have a valid user ID
    if (!userData?.id) {
      return;
    }

    const identifyUser = async () => {
      try {
        setLoading(true);

        // Ensure we're using the GUID format for RevenueCat
        const userIdForRevenueCat = userData.id;
        console.log(
          "RevenueCat identifying user with GUID:",
          userIdForRevenueCat
        );

        await RevenueCatService.safeLogin(
          userIdForRevenueCat,
          "InitializationProvider"
        );
        console.log(
          "RevenueCat user identified successfully:",
          userIdForRevenueCat
        );
      } catch (error) {
        console.error("Failed to identify user with RevenueCat:", error);
      } finally {
        setLoading(false);
      }
    };

    identifyUser();
  }, [userData?.id, setLoading]);

  // Listen for system theme changes when not in manual mode
  useEffect(() => {
    try {
      const subscription = Appearance.addChangeListener((_colorScheme) => {
        setManualMode(false);
      });

      return () => {
        subscription.remove();
      };
    } catch (error) {
      console.error("Theme listener error:", error);
    }
  }, [setManualMode]);

  // Set up RevenueCat CustomerInfo update listener
  useEffect(() => {
    if (!userData) {
      return;
    }

    console.log("[InitProvider] Setting up CustomerInfo update listener");
    const customerInfoUpdateListener = (info: CustomerInfo) => {
      console.log("[InitProvider] CustomerInfo updated from RevenueCat");

      // For debugging
      const hasPremium = RevenueCatService.hasPremiumEntitlement(info);
      console.log("[InitProvider] Premium entitlement active:", hasPremium);

      if (hasPremium && userData) {
        console.log("[InitProvider] Updating premium status in user store");
        updateUserStore(userData.id, info);
      }
    };

    Purchases.addCustomerInfoUpdateListener(customerInfoUpdateListener);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateListener);
    };
  }, [userData]);

  // Helper function to update user store from CustomerInfo
  const updateUserStore = (userId: string, info: CustomerInfo) => {
    const hasPremium = RevenueCatService.hasPremiumEntitlement(info);

    console.log(
      `[InitProvider] Updating user store - isPremium: ${hasPremium}`
    );

    useUserStore.getState().updateUserData({
      isPremium: hasPremium,
    });
  };

  return <>{children}</>;
};

export default InitializationProvider;
