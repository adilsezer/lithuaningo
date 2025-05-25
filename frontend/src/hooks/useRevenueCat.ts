import { useEffect, useState, useCallback } from 'react';
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  PurchasesError,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases';
import { useUserStore } from '@stores/useUserStore';
import { ENTITLEMENTS } from '@config/revenuecat.config';
import { useSetLoading, useSetError } from '@src/stores/useUIStore';

export const useRevenueCat = () => {
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  // Global UI state handlers
  const setLoading = useSetLoading();
  const setError = useSetError();

  // Fetch available offerings
  const fetchOfferings =
    useCallback(async (): Promise<PurchasesOffering | null> => {
      try {
        setLoading(true);
        setError(null);
        const offeringsResponse = await Purchases.getOfferings(); // Renamed to avoid conflict with state variable
        if (offeringsResponse.current) {
          setOfferings(offeringsResponse.current);
          return offeringsResponse.current;
        }
        return null;
      } catch (error) {
        console.error('Error fetching offerings:', error);
        setError('Failed to fetch subscription offerings');
        return null;
      } finally {
        setLoading(false);
      }
    }, [setLoading, setError]);

  // Check if user has premium entitlement
  const checkPremiumEntitlement = useCallback(
    async (info: CustomerInfo) => {
      // Check if the premium entitlement exists and is active
      const premiumEntitlement = info.entitlements.active[ENTITLEMENTS.premium];
      const hasPremium = typeof premiumEntitlement !== 'undefined';

      // Optimistically set local isPremium state based on RevenueCat CustomerInfo for immediate UI feedback.
      // This allows the UI to react instantly to purchases or restores.
      // The authoritative state will come from the backend (via webhooks and profile fetch).
      setIsPremium(hasPremium);

      // NOTE: Direct calls to UserProfileService for premium status updates were removed previously.
      // Backend is updated by RevenueCat webhooks.

      const currentUserData = useUserStore.getState().userData;
      if (currentUserData?.id) {
        console.log(
          '[useRevenueCat] CustomerInfo updated. Local isPremium set to:',
          hasPremium,
          'Backend will be updated via webhooks.'
        );
      }
    },
    [] // Remove userData dependency to prevent recreation
  );

  // Get current customer info
  const getCustomerInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      await checkPremiumEntitlement(info);
    } catch (error) {
      console.error('Error getting customer info:', error);
      setError('Failed to retrieve subscription status');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, checkPremiumEntitlement]);

  // Load offerings and customer info when the hook is mounted - RUN ONLY ONCE
  useEffect(() => {
    // RevenueCat is already initialized in InitializationProvider
    fetchOfferings();
    getCustomerInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - we want this to run only once on mount

  // Purchase a package
  const purchasePackage = async (pack: PurchasesPackage) => {
    try {
      console.log(
        '[RevenueCat] Starting purchase for package:',
        pack.identifier
      );
      setLoading(true);
      setError(null);
      setPurchaseError(null);

      // Ensure user is logged in to RevenueCat with correct ID
      const userData = useUserStore.getState().userData;
      if (userData?.id) {
        console.log(
          '[RevenueCat] Ensuring user is logged in with ID:',
          userData.id
        );
        await Purchases.logIn(userData.id);
      }

      const result = await Purchases.purchasePackage(pack);
      const purchasedCustomerInfo = result.customerInfo;
      setCustomerInfo(purchasedCustomerInfo);

      console.log(
        '[RevenueCat] Purchase successful for package:',
        pack.identifier
      );
      console.log(
        '[RevenueCat] Customer info:',
        JSON.stringify(purchasedCustomerInfo)
      );

      // Check and update premium status in user store
      const hasPremium =
        purchasedCustomerInfo.entitlements.active[ENTITLEMENTS.premium] !==
        undefined;
      console.log('[RevenueCat] Premium entitlement active:', hasPremium);

      if (hasPremium) {
        // Update user store with premium status
        console.log('[RevenueCat] Updating user store with premium status');
        useUserStore.getState().updateUserData({
          isPremium: true,
        });
      }

      // Update local state
      await checkPremiumEntitlement(purchasedCustomerInfo);

      return purchasedCustomerInfo;
    } catch (error: unknown) {
      console.error('Error purchasing package:', error);

      const purchaseErr = error as PurchasesError;
      if (purchaseErr.code !== PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        const errorMessage =
          (error as Error).message || 'An error occurred during purchase';
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
    if (offerings) {
      return offerings;
    }
    return fetchOfferings();
  };

  // Restore purchases
  const restorePurchases = async () => {
    try {
      setLoading(true);
      setError(null);
      setPurchaseError(null);

      const restoredCustomerInfo = await Purchases.restorePurchases(); // Renamed

      setCustomerInfo(restoredCustomerInfo);
      await checkPremiumEntitlement(restoredCustomerInfo);

      return restoredCustomerInfo;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      const purchaseErr = error as PurchasesError; // Renamed
      if (purchaseErr.code !== PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        const errorMessage =
          (error as Error).message || // Type assertion
          'An error occurred while restoring purchases';
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
      console.error('Error showing subscription management:', error);
      setError('Failed to open subscription management');
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
      console.error('Error logging out from RevenueCat:', error);
      setError('Failed to sign out from subscription service');
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
