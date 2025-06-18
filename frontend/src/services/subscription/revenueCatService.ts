import Purchases, { CustomerInfo } from "react-native-purchases";
import { ENTITLEMENTS } from "@config/revenuecat.config";

/**
 * Centralized RevenueCat service to handle common operations
 * and eliminate code duplication across the app
 */
class RevenueCatService {
  /**
   * Safely logout from RevenueCat only if user is not anonymous
   * This prevents the common "LogOut was called but the current user is anonymous" error
   */
  static async safeLogout(context: string = ""): Promise<void> {
    try {
      // Check if user is anonymous before attempting logout
      const isAnonymous = await this.isAnonymousUser();
      if (!isAnonymous) {
        await Purchases.logOut();
        console.log(`[RevenueCatService] ${context}: Logout successful.`);
      } else {
        console.log(
          `[RevenueCatService] ${context}: User is anonymous, skipping logout.`
        );
      }
    } catch (rcError) {
      const errorMessage =
        rcError instanceof Error ? rcError.message : String(rcError);
      if (!errorMessage.includes("anonymous")) {
        console.warn(
          `[RevenueCatService] ${context}: Failed to logout:`,
          rcError
        );
      } else {
        console.log(
          `[RevenueCatService] ${context}: Logout skipped - user is anonymous.`
        );
      }
    }
  }

  /**
   * Check if current user is anonymous
   */
  static async isAnonymousUser(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.originalAppUserId === "$RCAnonymousID";
    } catch (error) {
      console.warn(
        "[RevenueCatService] Failed to check if user is anonymous:",
        error
      );
      return true; // Assume anonymous on error to be safe
    }
  }

  /**
   * Safely login to RevenueCat with user ID
   */
  static async safeLogin(userId: string, context: string = ""): Promise<void> {
    try {
      await Purchases.logIn(userId);
      console.log(
        `[RevenueCatService] ${context}: Login successful for user ${userId}.`
      );
    } catch (error) {
      console.error(
        `[RevenueCatService] ${context}: Failed to login user ${userId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get customer info safely with error handling
   * This is a stateless operation that can be safely centralized
   */
  static async getCustomerInfo(context: string = ""): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      console.log(
        `[RevenueCatService] ${context}: CustomerInfo retrieved successfully.`
      );
      return customerInfo;
    } catch (error) {
      console.error(
        `[RevenueCatService] ${context}: Failed to get customer info:`,
        error
      );
      throw error;
    }
  }

  /**
   * Check if user has premium entitlement based on customer info
   * This is a pure function that doesn't involve state
   */
  static hasPremiumEntitlement(customerInfo: CustomerInfo): boolean {
    try {
      return (
        customerInfo?.entitlements?.active?.[ENTITLEMENTS.premium] !== undefined
      );
    } catch (error) {
      console.warn(
        "[RevenueCatService] Failed to check premium entitlement:",
        error
      );
      return false;
    }
  }
}

export default RevenueCatService;
