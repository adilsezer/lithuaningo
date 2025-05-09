import { apiClient } from "@src/services/api/apiClient";
import { useUserStore } from "@src/stores/useUserStore";
import {
  UpdateUserProfileRequest,
  UserProfileResponse,
} from "@src/types/UserProfile";
import { CustomerInfo } from "react-native-purchases";
import { ENTITLEMENTS } from "@config/revenuecat.config";

/**
 * User Profile Service for managing user profile-related operations
 * including premium subscription status
 */
export class UserProfileService {
  /**
   * Safely parses an expiration date from RevenueCat
   *
   * RevenueCat sends one of two formats:
   * 1. Unix timestamp in seconds (as number or string)
   * 2. ISO string date format
   *
   * @param expirationDate The expiration date from RevenueCat
   * @returns An ISO string date or undefined if parsing fails
   */
  private static parseExpirationDate(expirationDate: any): string | undefined {
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
  }

  /**
   * Creates a far-future date for lifetime subscriptions
   * @param yearsToAdd Number of years to add to current date
   * @returns ISO string date
   */
  private static createFarFutureDate(yearsToAdd: number = 10): string {
    const farFuture = new Date();
    farFuture.setFullYear(farFuture.getFullYear() + yearsToAdd);
    return farFuture.toISOString();
  }

  /**
   * Updates the user's premium status in their profile based on RevenueCat CustomerInfo
   *
   * @param userId The user's ID
   * @param customerInfo RevenueCat CustomerInfo containing subscription details
   * @param isPremium Whether the user has an active premium subscription
   * @returns The updated user profile
   */
  static async updatePremiumStatus(
    userId: string,
    customerInfo: CustomerInfo,
    isPremium: boolean
  ): Promise<UserProfileResponse> {
    try {
      // First, get the current user profile to maintain existing data
      const currentProfile = await apiClient.getUserProfile(userId);

      // Handle expiration date logic
      let premiumExpiresAt: string | undefined = undefined;

      // Use the entitlement ID from config to properly handle case sensitivity
      const entitlementId = ENTITLEMENTS.premium;

      if (isPremium && customerInfo?.entitlements?.active?.[entitlementId]) {
        const premiumEntitlement =
          customerInfo.entitlements.active[entitlementId];
        const rawExpirationDate = premiumEntitlement.expirationDate;
        const productId = premiumEntitlement.productIdentifier || "";

        // Try to parse the expiration date from RevenueCat
        if (rawExpirationDate) {
          premiumExpiresAt = this.parseExpirationDate(rawExpirationDate);
        }

        // Only use fallbacks if we couldn't parse the expiration date
        if (!premiumExpiresAt && premiumEntitlement.isActive) {
          const isLifetime = productId.includes("lifetime");
          const isMonthly = productId.includes("monthly");

          // Set appropriate fallback date based on subscription type
          if (isLifetime) {
            premiumExpiresAt = this.createFarFutureDate(20);
          } else if (isMonthly) {
            const oneMonth = new Date();
            oneMonth.setMonth(oneMonth.getMonth() + 1);
            premiumExpiresAt = oneMonth.toISOString();
          } else {
            premiumExpiresAt = this.createFarFutureDate(1);
          }
        }
      }

      // Final fallback for database constraint
      if (isPremium && !premiumExpiresAt) {
        premiumExpiresAt = this.createFarFutureDate(1);
      }

      // Create update request with premium status
      const updateRequest: UpdateUserProfileRequest = {
        email: currentProfile.email,
        emailVerified: currentProfile.emailVerified,
        fullName: currentProfile.fullName,
        avatarUrl: currentProfile.avatarUrl,
        isAdmin: currentProfile.isAdmin,
        isPremium: isPremium,
        premiumExpiresAt: premiumExpiresAt,
      };

      // Update the profile via API
      try {
        const updatedProfile = await apiClient.updateUserProfile(
          userId,
          updateRequest
        );

        // Update the user store with new premium status
        const { updateUserProfile } = useUserStore.getState();
        updateUserProfile({
          isPremium,
          premiumExpiresAt,
        });

        return updatedProfile;
      } catch (error) {
        console.error("Failed to update profile in backend:", error);

        // Still update local state to ensure UI reflects premium status
        const { updateUserProfile } = useUserStore.getState();
        updateUserProfile({
          isPremium,
          premiumExpiresAt,
        });

        // Return the current profile with updated fields
        return {
          ...currentProfile,
          isPremium,
          premiumExpiresAt,
        };
      }
    } catch (error) {
      console.error(
        "[UserProfileService] Error updating premium status:",
        error
      );
      throw error;
    }
  }

  /**
   * Removes premium status from a user profile when subscription ends
   *
   * @param userId The user's ID
   * @returns The updated user profile
   */
  static async removePremiumStatus(
    userId: string
  ): Promise<UserProfileResponse> {
    try {
      // First, get the current user profile to maintain existing data
      const currentProfile = await apiClient.getUserProfile(userId);

      // Create update request with premium status set to false
      const updateRequest: UpdateUserProfileRequest = {
        email: currentProfile.email,
        emailVerified: currentProfile.emailVerified,
        fullName: currentProfile.fullName,
        avatarUrl: currentProfile.avatarUrl,
        isAdmin: currentProfile.isAdmin,
        isPremium: false,
        premiumExpiresAt: undefined,
      };

      // Update the profile via API
      try {
        const updatedProfile = await apiClient.updateUserProfile(
          userId,
          updateRequest
        );

        // Update the user store with new premium status
        const { updateUserProfile } = useUserStore.getState();
        updateUserProfile({
          isPremium: false,
          premiumExpiresAt: undefined,
        });

        return updatedProfile;
      } catch (error) {
        console.error("Failed to update profile in backend:", error);

        // Still update local state
        const { updateUserProfile } = useUserStore.getState();
        updateUserProfile({
          isPremium: false,
          premiumExpiresAt: undefined,
        });

        // Return current profile with updated fields
        return {
          ...currentProfile,
          isPremium: false,
          premiumExpiresAt: undefined,
        };
      }
    } catch (error) {
      console.error(
        "[UserProfileService] Error removing premium status:",
        error
      );
      throw error;
    }
  }
}
