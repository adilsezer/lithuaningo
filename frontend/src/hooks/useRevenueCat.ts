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

  // Handle expiration date that might be in different formats
  const parseExpirationDate = (
    expirationDate: string | number | null
  ): string | undefined => {
    if (!expirationDate) return undefined;

    try {
      // If it's already an ISO string date format (e.g. "2025-05-09T23:16:35Z")
      if (typeof expirationDate === "string" && expirationDate.includes("T")) {
        return new Date(expirationDate).toISOString();
      }

      // If it's a Unix timestamp in seconds (number or string)
      const timestamp = Number(expirationDate);
      if (!isNaN(timestamp)) {
        // Convert seconds to milliseconds (JS Date uses milliseconds)
        return new Date(timestamp * 1000).toISOString();
      }

      console.warn(`Unrecognized date format: ${expirationDate}`);
      return undefined;
    } catch (error) {
      console.error("Error parsing expiration date:", error);
      return undefined;
    }
  };

  // Check if user has premium entitlement
  const checkPremiumEntitlement = async (info: CustomerInfo) => {
    // Check if the premium entitlement exists and is active
    const premiumEntitlement = info.entitlements.active[ENTITLEMENTS.premium];
    const hasPremium = typeof premiumEntitlement !== "undefined";

    setIsPremium(hasPremium);

    // Update user profile in Supabase if user is authenticated
    if (userData?.id) {
      try {
        if (hasPremium && premiumEntitlement) {
          // Check if this is a lifetime subscription (no expiration but active)
          const isLifetime =
            premiumEntitlement.isActive &&
            !premiumEntitlement.expirationDate &&
            premiumEntitlement.productIdentifier.includes("lifetime");

          // Get expiration date from the entitlement
          const expirationDate = premiumEntitlement.expirationDate;

          // Handle specific cases:
          // 1. Regular subscription with valid expiration date
          // 2. Lifetime subscription (no expiration date)
          if (expirationDate) {
            // Safely parse the expiration date
            const expiresAt = parseExpirationDate(expirationDate);
            if (expiresAt) {
              // Copy the premiumEntitlement to avoid any reference issues
              const safeInfo = JSON.parse(JSON.stringify(info));

              // Update premium status with expiration date
              await UserProfileService.updatePremiumStatus(
                userData.id,
                safeInfo,
                hasPremium
              );
            } else {
              // Fall back to the lifetime handling
              const farFuture = new Date();
              farFuture.setFullYear(farFuture.getFullYear() + 10);

              // Create a CustomerInfo object with the modified expiration
              const modifiedInfo = {
                ...info,
                entitlements: {
                  ...info.entitlements,
                  active: {
                    ...info.entitlements.active,
                    [ENTITLEMENTS.premium]: {
                      ...premiumEntitlement,
                      expirationDate: (farFuture.getTime() / 1000).toString(),
                    },
                  },
                },
              };

              await UserProfileService.updatePremiumStatus(
                userData.id,
                modifiedInfo,
                hasPremium
              );
            }
          } else if (isLifetime || premiumEntitlement.isActive) {
            // Handle lifetime subscriptions which may not have expiration dates
            // Set a far-future expiration date (10 years from now)
            const farFuture = new Date();
            farFuture.setFullYear(farFuture.getFullYear() + 10);

            // Create a CustomerInfo object with the modified expiration
            const modifiedInfo = {
              ...info,
              entitlements: {
                ...info.entitlements,
                active: {
                  ...info.entitlements.active,
                  [ENTITLEMENTS.premium]: {
                    ...premiumEntitlement,
                    expirationDate: (farFuture.getTime() / 1000).toString(),
                  },
                },
              },
            };

            await UserProfileService.updatePremiumStatus(
              userData.id,
              modifiedInfo,
              hasPremium
            );
          }
        } else if (userData.isPremium) {
          // If user was premium but no longer is, update status to false
          await UserProfileService.removePremiumStatus(userData.id);
        }
      } catch (error) {
        console.error("Error updating premium status in user profile:", error);
        // Don't surface this error to the user as it doesn't affect their immediate experience
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
