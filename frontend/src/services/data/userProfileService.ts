import { apiClient } from "@src/services/api/apiClient";
import { useUserStore } from "@src/stores/useUserStore";
import {
  UpdateUserProfileRequest,
  UserProfileResponse,
} from "@src/types/UserProfile";
import { CustomerInfo } from "react-native-purchases";

/**
 * User Profile Service for managing user profile-related operations
 * including premium subscription status
 */
export class UserProfileService {
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

      // Determine premium expiration date from customerInfo
      let premiumExpiresAt: string | undefined = undefined;

      if (isPremium && customerInfo.entitlements.active.premium) {
        const expirationDate =
          customerInfo.entitlements.active.premium.expirationDate;
        if (expirationDate) {
          // Convert seconds to milliseconds and create a Date object
          // Cast expirationDate to number to ensure it's treated as a number
          const expirationTimeMs = Number(expirationDate) * 1000;
          premiumExpiresAt = new Date(expirationTimeMs).toISOString();
        }
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
      console.error(
        "[UserProfileService] Error removing premium status:",
        error
      );
      throw error;
    }
  }
}
