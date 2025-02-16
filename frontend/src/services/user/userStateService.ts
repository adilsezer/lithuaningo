import { User } from "@supabase/supabase-js";
import { useUserStore } from "@stores/useUserStore";
import apiClient from "@services/api/apiClient";

export const updateUserState = async (session: { user: User } | null) => {
  console.log("[updateUserState] Starting with session:", {
    hasSession: !!session,
  });

  if (!session?.user) {
    console.error("[updateUserState] No user in session");
    throw new Error("User is unexpectedly null or undefined.");
  }

  const { user } = session;
  if (!user.email) {
    console.error("[updateUserState] No email in user data");
    throw new Error("User email is unexpectedly null or undefined.");
  }

  const name = user.user_metadata?.name;
  if (!name || typeof name !== "string") {
    console.error(
      "[updateUserState] Invalid or missing name in metadata:",
      user.user_metadata
    );
    throw new Error("User name is required and must be a string");
  }

  console.log("[updateUserState] Updating user store with:", {
    id: user.id,
    email: user.email,
    name,
    emailConfirmed: !!user.email_confirmed_at,
  });

  useUserStore.getState().logIn({
    id: user.id,
    email: user.email,
    fullName: name,
    emailVerified: user.email_confirmed_at !== null,
    isAdmin: false,
    isPremium: false,
    premiumExpiresAt: undefined,
  });

  console.log("[updateUserState] Store updated, ensuring user profile");
  await ensureUserProfile(user.id, user.email, name);
  console.log("[updateUserState] User state update completed");
};

const ensureUserProfile = async (
  userId: string,
  email: string,
  name: string
) => {
  console.log("[ensureUserProfile] Starting with:", { email, name, userId });

  try {
    console.log("[ensureUserProfile] Getting session");
    try {
      console.log("[ensureUserProfile] Fetching existing profile");
      await apiClient.getUserProfile(userId);
      console.log("[ensureUserProfile] Existing profile found");
      return true;
    } catch (error: any) {
      if (error?.status === 404) {
        console.log(
          "[ensureUserProfile] No existing profile, creating new one"
        );
        const createProfileRequest = {
          userId,
          email,
          emailVerified: true,
          fullName: name,
          isAdmin: false,
          isPremium: false,
          premiumExpiresAt: undefined,
          lastLoginAt: new Date().toISOString(),
        };

        await apiClient.createUserProfile(createProfileRequest);
        console.log("[ensureUserProfile] New profile created successfully");
        return true;
      }
      throw error;
    }
  } catch (error: any) {
    console.error("[ensureUserProfile] Error:", error);
    throw new Error("Failed to create or update user profile");
  }
};
