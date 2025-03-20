import { useEffect, useState } from "react";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  LOG_LEVEL,
  PurchasesPackage,
  PurchasesError,
  PURCHASES_ERROR_CODE,
} from "react-native-purchases";
import { useUserData } from "@stores/useUserStore";
import {
  REVENUECAT_API_KEYS,
  ENTITLEMENTS,
  DEBUG_SETTINGS,
} from "@config/revenuecat.config";

export const useRevenueCat = () => {
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  const userData = useUserData();

  useEffect(() => {
    // Initialize RevenueCat
    const initializeRevenueCat = async () => {
      Purchases.setLogLevel(
        DEBUG_SETTINGS.enableDebugLogs ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR
      );

      if (Platform.OS === "ios") {
        await Purchases.configure({ apiKey: REVENUECAT_API_KEYS.ios });
      } else if (Platform.OS === "android") {
        await Purchases.configure({ apiKey: REVENUECAT_API_KEYS.android });
      }

      // Login the user if they're authenticated
      if (userData?.id) {
        await Purchases.logIn(userData.id);
      }

      fetchOfferings();
      getCustomerInfo();
    };

    initializeRevenueCat();

    return () => {
      // If needed, perform cleanup here
    };
  }, [userData?.id]);

  // Fetch available offerings
  const fetchOfferings = async () => {
    try {
      setIsLoading(true);
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setOfferings(offerings.current);
      }
    } catch (error) {
      console.error("Error fetching offerings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current customer info
  const getCustomerInfo = async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      checkPremiumEntitlement(info);
    } catch (error) {
      console.error("Error getting customer info:", error);
    }
  };

  // Check if user has premium entitlement
  const checkPremiumEntitlement = (info: CustomerInfo) => {
    const hasPremium =
      typeof info.entitlements.active[ENTITLEMENTS.premium] !== "undefined";
    setIsPremium(hasPremium);

    // Update premium status in your app state if needed
    // This might be integrated with your user store elsewhere
  };

  // Purchase a package
  const purchasePackage = async (pack: PurchasesPackage) => {
    try {
      setIsLoading(true);
      setPurchaseError(null);

      // TypeScript doesn't allow direct destructuring here due to typing issues
      // We need to manually access the customerInfo property
      const result = await Purchases.purchasePackage(pack);
      // Use casting to address the TypeScript type issue
      const customerInfo = result.customerInfo as CustomerInfo;
      setCustomerInfo(customerInfo);
      checkPremiumEntitlement(customerInfo);
      return customerInfo;
    } catch (error) {
      console.error("Error purchasing package:", error);

      // Handle user cancellation separately
      const purchaseError = error as PurchasesError;
      if (
        purchaseError.code !== PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
      ) {
        setPurchaseError(
          purchaseError.message || "An error occurred during purchase"
        );
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Restore purchases
  const restorePurchases = async () => {
    try {
      setIsLoading(true);
      setPurchaseError(null);

      // TypeScript doesn't allow direct destructuring here due to typing issues
      // We need to manually access the customerInfo property
      const result = await Purchases.restorePurchases();
      // Use casting to address the TypeScript type issue
      const customerInfo = (result as any).customerInfo as CustomerInfo;
      setCustomerInfo(customerInfo);
      checkPremiumEntitlement(customerInfo);
      return customerInfo;
    } catch (error) {
      console.error("Error restoring purchases:", error);
      const purchaseError = error as PurchasesError;
      if (
        purchaseError.code !== PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
      ) {
        setPurchaseError(
          purchaseError.message || "An error occurred while restoring purchases"
        );
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user logout
  const logout = async () => {
    try {
      await Purchases.logOut();
      setCustomerInfo(null);
      setIsPremium(false);
    } catch (error) {
      console.error("Error logging out from RevenueCat:", error);
    }
  };

  return {
    offerings,
    customerInfo,
    isPremium,
    isLoading,
    purchaseError,
    purchasePackage,
    restorePurchases,
    fetchOfferings,
    getCustomerInfo,
    logout,
  };
};
