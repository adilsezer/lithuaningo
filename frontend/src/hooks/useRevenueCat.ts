import { useEffect, useState } from "react";
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  PurchasesError,
  PURCHASES_ERROR_CODE,
} from "react-native-purchases";
import { useUserData } from "@stores/useUserStore";
import { ENTITLEMENTS } from "@config/revenuecat.config";
import { useSetLoading, useSetError } from "@src/stores/useUIStore";
import { UserProfileService } from "@src/services/data/userProfileService";

export const useRevenueCat = () => {
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  // Global UI state handlers
  const setLoading = useSetLoading();
  const setError = useSetError();

  const userData = useUserData();

  // Load offerings and customer info when the hook is mounted or userData changes
  useEffect(() => {
    // RevenueCat is already initialized in InitializationProvider
    fetchOfferings();
    getCustomerInfo();
  }, []); // Run only once when component mounts since getCustomerInfo handles userData internally

  // Fetch available offerings
  const fetchOfferings = async (): Promise<PurchasesOffering | null> => {
    try {
      setLoading(true);
      setError(null);
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setOfferings(offerings.current);
        return offerings.current;
      }
      return null;
    } catch (error) {
      console.error("Error fetching offerings:", error);
      setError("Failed to fetch subscription offerings");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get current customer info
  const getCustomerInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      await checkPremiumEntitlement(info);
    } catch (error) {
      console.error("Error getting customer info:", error);
      setError("Failed to retrieve subscription status");
    } finally {
      setLoading(false);
    }
  };

  // Check if user has premium entitlement
  const checkPremiumEntitlement = async (info: CustomerInfo) => {
    const hasPremium =
      typeof info.entitlements.active[ENTITLEMENTS.premium] !== "undefined";
    setIsPremium(hasPremium);

    // Update user profile in Supabase if user is authenticated
    if (userData?.id) {
      try {
        if (hasPremium) {
          // Update premium status to true with expiration date
          await UserProfileService.updatePremiumStatus(
            userData.id,
            info,
            hasPremium
          );
        } else if (userData.isPremium) {
          // If user was premium but no longer is, update status to false
          await UserProfileService.removePremiumStatus(userData.id);
        }
      } catch (error) {
        console.error("Error updating premium status in user profile:", error);
      }
    }
  };

  // Purchase a package
  const purchasePackage = async (pack: PurchasesPackage) => {
    try {
      setLoading(true);
      setError(null);
      setPurchaseError(null);

      // TypeScript doesn't allow direct destructuring here due to typing issues
      // We need to manually access the customerInfo property
      const result = await Purchases.purchasePackage(pack);
      // Use casting to address the TypeScript type issue
      const customerInfo = result.customerInfo as CustomerInfo;
      setCustomerInfo(customerInfo);

      // Check premium entitlement and update user profile
      await checkPremiumEntitlement(customerInfo);

      return customerInfo;
    } catch (error) {
      console.error("Error purchasing package:", error);

      // Handle user cancellation separately
      const purchaseError = error as PurchasesError;
      if (
        purchaseError.code !== PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
      ) {
        const errorMessage =
          purchaseError.message || "An error occurred during purchase";
        setPurchaseError(errorMessage);
        setError(errorMessage);
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Ensure offerings are loaded - useful to call before showing paywall
  const ensureOfferings = async (): Promise<PurchasesOffering | null> => {
    if (offerings) return offerings;
    return fetchOfferings();
  };

  // Restore purchases
  const restorePurchases = async () => {
    try {
      setLoading(true);
      setError(null);
      setPurchaseError(null);

      // Fixed return type handling
      const customerInfo = await Purchases.restorePurchases();

      setCustomerInfo(customerInfo);

      // Check premium entitlement and update user profile
      await checkPremiumEntitlement(customerInfo);

      return customerInfo;
    } catch (error) {
      console.error("Error restoring purchases:", error);
      const purchaseError = error as PurchasesError;
      if (
        purchaseError.code !== PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
      ) {
        const errorMessage =
          purchaseError.message ||
          "An error occurred while restoring purchases";
        setPurchaseError(errorMessage);
        setError(errorMessage);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Show subscription management screen
  const showManageSubscriptions = async () => {
    try {
      setLoading(true);
      await Purchases.showManageSubscriptions();
    } catch (error) {
      console.error("Error showing subscription management:", error);
      setError("Failed to open subscription management");
    } finally {
      setLoading(false);
    }
  };

  // Handle user logout
  const logout = async () => {
    try {
      setLoading(true);
      await Purchases.logOut();
      setCustomerInfo(null);
      setIsPremium(false);
    } catch (error) {
      console.error("Error logging out from RevenueCat:", error);
      setError("Failed to sign out from subscription service");
    } finally {
      setLoading(false);
    }
  };

  return {
    offerings,
    customerInfo,
    isPremium,
    purchaseError,
    purchasePackage,
    restorePurchases,
    showManageSubscriptions,
    fetchOfferings,
    getCustomerInfo,
    logout,
    ensureOfferings,
  };
};
