import { Session } from "@supabase/supabase-js";
import { apiClient } from "../api/apiClient";
import { useUserStore, UserData } from "../../stores/useUserStore"; // Adjusted path
import RevenueCatService from "../subscription/revenueCatService";
// import { getErrorMessage } from "@utils/errorMessages"; // Assuming this is not needed if just returning boolean for now

export const hydrateUserSessionAndProfile = async (
  session: Session
): Promise<boolean> => {
  const { user } = session;
  if (!user?.email) {
    console.error(
      "[UserProfileService] No user or email in session for hydration. Cannot proceed."
    );
    return false;
  }

  // Only log user IDs in development
  if (__DEV__) {
    console.log(`[UserProfileService] Starting hydration for user: ${user.id}`);
  } else {
    console.log("[UserProfileService] Starting user hydration");
  }

  // Check if email verification is in progress
  if (useUserStore.getState().isVerifyingEmail) {
    console.log(
      `[UserProfileService] Email verification in progress for ${user.id}. Skipping full hydration.`
    );
    // Optionally, you might still want to log in to Purchases here if needed,
    // or handle it consistently with how updateAuthState does it.
    // For now, just returning true as the session technically exists from Supabase perspective.
    return true;
  }

  try {
    const userProfile = await apiClient.getUserProfile(user.id);

    const userData: UserData = {
      id: userProfile.id,
      email: userProfile.email,
      fullName: userProfile.fullName,
      avatarUrl: userProfile.avatarUrl,
      emailVerified: userProfile.emailVerified,
      isAdmin: userProfile.isAdmin,
      isPremium: userProfile.isPremium,
      authProvider: userProfile.authProvider,
      termsAccepted: userProfile.termsAccepted,
    };

    useUserStore.getState().logIn(userData);

    await RevenueCatService.safeLogin(user.id, "hydrateUserSessionAndProfile");

    // Only log user IDs in development
    if (__DEV__) {
      console.log(
        `[UserProfileService] Hydration successful for user: ${user.id}`
      );
    } else {
      console.log("[UserProfileService] User hydration successful");
    }
    return true;
  } catch (error) {
    // Only log user IDs in development, sanitize error data
    if (__DEV__) {
      console.error(
        `[UserProfileService] Error during user hydration for ${user.id}:`,
        error instanceof Error ? error.message : "Unknown error"
      );
    } else {
      console.error(
        "[UserProfileService] Error during user hydration:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
    await clearUserSessionAndLogout();
    return false;
  }
};

export const clearUserSessionAndLogout = async () => {
  console.log(
    "[UserProfileService] Clearing user session and logging out from RevenueCat."
  );
  useUserStore.getState().logOut();
  await RevenueCatService.safeLogout("clearUserSession");
};
