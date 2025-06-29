import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { useUserStore } from "@stores/useUserStore";
import { getErrorMessage } from "@utils/errorMessages";
import { supabase } from "@services/supabase/supabaseClient";
import { Session, User } from "@supabase/supabase-js";
import { AUTH_PATTERNS } from "@utils/validationPatterns";
import { AuthResponse } from "@src/types/auth.types";
import { generateAnonymousName } from "@utils/userUtils";
import { apiClient } from "../api/apiClient";
import RevenueCatService from "../subscription/revenueCatService";

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  offlineAccess: true,
});

// Auth state management
export const updateAuthState = async (session: Session | null) => {
  console.log(
    "[authService.ts] updateAuthState: Called with session for user:",
    session?.user?.id || "NO SESSION"
  );
  const isVerifying = useUserStore.getState().isVerifyingEmail;

  if (!session?.user) {
    console.error(
      "[AuthService] updateAuthState: No user in session or session is null. Clearing local state."
    );
    useUserStore.getState().logOut();
    await RevenueCatService.safeLogout("updateAuthState on null session");
    return;
  }

  const { user } = session;
  if (!user.email) {
    console.error(
      "[AuthService] updateAuthState: No email in user data. This should not happen."
    );
    useUserStore.getState().logOut();
    await RevenueCatService.safeLogout("missing email error");
    return;
  }

  try {
    const userProfile = await apiClient.getUserProfile(user.id);

    const userData = {
      id: user.id,
      email: userProfile.email,
      fullName: userProfile.fullName,
      emailVerified: userProfile.emailVerified,
      isAdmin: userProfile.isAdmin,
      isPremium: userProfile.isPremium,
      authProvider: userProfile.authProvider,
      termsAccepted: userProfile.termsAccepted,
    };

    if (!isVerifying) {
      console.log(
        "[authService.ts] updateAuthState: NOT verifying email, calling userStore.logIn()."
      );
      useUserStore.getState().logIn(userData);
    } else {
      console.log(
        "[authService.ts] updateAuthState: IS verifying email, SKIPPING userStore.logIn()."
      );
    }

    await RevenueCatService.safeLogin(user.id, "updateAuthState");
  } catch (error) {
    console.error(
      `[AuthService] updateAuthState: Error during state update for user ${user.id}:`,
      error
    );
    useUserStore.getState().logOut();
    await RevenueCatService.safeLogout(
      `updateAuthState error for user ${user.id}`
    );
  }
};

// Helper Functions
/**
 * Handle Google sign-out with retry logic and proper error handling
 */
const handleGoogleSignOut = async (): Promise<void> => {
  try {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (!isSignedIn) {
      console.info("Google user is not signed in, skipping Google sign-out");
      return;
    }

    // Try revoking access first, but don't fail if it errors
    try {
      await GoogleSignin.revokeAccess();
    } catch (revokeError) {
      console.warn("Google revoke access failed (non-critical):", revokeError);
    }

    // Always attempt sign out, even if revoke failed
    await GoogleSignin.signOut();
    console.info("Google sign-out completed successfully");
  } catch (googleError) {
    // Google sign-out errors are non-critical for the overall logout process
    // The user is already signed out from Supabase, which is the primary auth
    console.warn("Google sign out error (non-critical):", googleError);

    const errorMessage =
      googleError instanceof Error ? googleError.message : String(googleError);
    if (errorMessage.includes("400")) {
      console.info(
        "Google sign-out failed with 400 error - this is often due to already being signed out or token expiration"
      );
    } else if (errorMessage.includes("network")) {
      console.info(
        "Google sign-out failed due to network issues - this is non-critical"
      );
    }
  }
};

const handleAuthError = (error: unknown): AuthResponse => {
  console.error("[AuthService] Auth operation failed:", error);

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.includes("Email not confirmed")
  ) {
    return {
      success: false,
      message: "Please verify your email before logging in.",
      code: "EMAIL_NOT_VERIFIED",
      email:
        error && typeof error === "object" && "email" in error
          ? String(error.email)
          : undefined,
    };
  }

  // Extract error code or message for getErrorMessage
  const errorCode =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "default";

  return {
    success: false,
    message: getErrorMessage(errorCode) || "Authentication failed",
  };
};

// Auth Functions
export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> => {
  try {
    if (!AUTH_PATTERNS.EMAIL.test(email)) {
      return { success: false, message: "Please enter a valid email address." };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name || generateAnonymousName(crypto.randomUUID()),
          avatar_url: "",
          is_admin: false,
          is_premium: false,
          provider: "email",
          terms_accepted: true,
        },
      },
    });

    if (error) {
      throw error;
    }

    if (data.user?.identities?.length === 0) {
      return {
        success: false,
        message: "The email address is already registered.",
      };
    }

    return {
      success: true,
      message:
        "Registration successful! Please verify your email with the code sent.",
    };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const verifyEmail = async (
  email: string,
  token: string
): Promise<AuthResponse> => {
  console.log("[authService.ts] verifyEmail: Started for email:", email);
  try {
    useUserStore.getState().setVerifyingEmail(true);
    const { data: _verifyData, error: verifyError } =
      await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      });

    if (verifyError) {
      throw verifyError;
    }

    await supabase.auth.signOut();

    console.log("[authService.ts] verifyEmail: Process successful for:", email);
    return {
      success: true,
      message: "Email verified successfully! You can now log in.",
    };
  } catch (error) {
    console.error("[authService.ts] verifyEmail: Error for", email, error);
    return handleAuthError(error);
  } finally {
    useUserStore.getState().setVerifyingEmail(false);
    console.log("[authService.ts] verifyEmail: Finished for:", email);
  }
};

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message?.toLowerCase().includes("email not confirmed")) {
        return {
          success: false,
          message: "Please verify your email before logging in.",
          code: "EMAIL_NOT_VERIFIED",
          email,
        };
      }
      console.error(
        "[authService] signInWithEmail: Supabase signInWithPassword error:",
        error
      );
      throw error;
    }

    if (!data.user || !data.session) {
      console.error(
        "[authService] signInWithEmail: No user data or session received from Supabase."
      );
      throw new Error("No user data received");
    }
    return { success: true, message: "Successfully logged in" };
  } catch (error) {
    return handleAuthError(error);
  }
};

// Helper function for Google authentication
const authenticateWithGoogle = async (): Promise<{
  data: { user: User | null; session: Session | null };
  displayName: string;
  avatarUrl: string;
}> => {
  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();
  const tokens = await GoogleSignin.getTokens();

  if (!userInfo.idToken) {
    console.error(
      "[authService] authenticateWithGoogle: Failed to get ID token from Google Sign-In."
    );
    throw new Error("Failed to get ID token from Google Sign-In");
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: userInfo.idToken,
    access_token: tokens.accessToken,
  });

  if (error) {
    throw error;
  }

  if (!data.user || !data.session) {
    console.error(
      "[authService] authenticateWithGoogle: No user data or session received from Supabase."
    );
    throw new Error("No user data received from authentication");
  }

  const displayName =
    userInfo.user.name ||
    data.user.user_metadata?.name ||
    generateAnonymousName(data.user.id);

  return {
    data,
    displayName,
    avatarUrl: userInfo.user.photo || "",
  };
};

// Helper function for Apple authentication
const authenticateWithApple = async (): Promise<{
  data: { user: User | null; session: Session | null };
  displayName: string;
  avatarUrl: string;
}> => {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    console.error(
      "[authService] authenticateWithApple: No identity token from Apple Sign-In."
    );
    throw new Error("No identity token from Apple Sign-In");
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: credential.identityToken,
    access_token: credential.authorizationCode || undefined,
  });

  if (error) {
    throw error;
  }

  if (!data.user || !data.session) {
    console.error(
      "[authService] authenticateWithApple: No user data or session received from Supabase."
    );
    throw new Error("No user data received from authentication");
  }

  const displayName =
    (credential.fullName?.givenName && credential.fullName?.familyName
      ? `${credential.fullName.givenName} ${credential.fullName.familyName}`.trim()
      : null) ||
    data.user.user_metadata?.display_name ||
    data.user.user_metadata?.name ||
    generateAnonymousName(data.user.id);

  return {
    data,
    displayName,
    avatarUrl: data.user.user_metadata?.avatar_url || "",
  };
};

// Helper function to update user metadata
const updateUserMetadata = async (
  displayName: string,
  avatarUrl: string,
  setTermsAccepted: boolean,
  provider: string
): Promise<void> => {
  const updateData: Record<string, string | boolean> = {
    display_name: displayName,
    avatar_url: avatarUrl,
  };

  if (setTermsAccepted) {
    updateData.terms_accepted = true;
  }

  const { error: updateError } = await supabase.auth.updateUser({
    data: updateData,
  });

  if (updateError) {
    console.warn(
      `[authService] Failed to update user metadata for ${provider}:`,
      updateError
    );
  }
};

// Unified social auth function that handles both new and existing users
export const signInWithGoogle = async (): Promise<AuthResponse> => {
  try {
    const { data, displayName, avatarUrl } = await authenticateWithGoogle();

    // Always update basic metadata (display name and avatar)
    await updateUserMetadata(displayName, avatarUrl, false, "signInWithGoogle");

    // Check if user has accepted terms
    if (data.user) {
      try {
        const userProfile = await apiClient.getUserProfile(data.user.id);

        if (!userProfile.termsAccepted) {
          // Sign out the user and show guidance
          await supabase.auth.signOut();
          return {
            success: false,
            message:
              "Please use the signup page to agree to our Terms of Service and Privacy Policy.",
            code: "TERMS_REQUIRED",
          };
        }
      } catch {
        // If we can't get the profile, it might be a new user
        // Sign them out and direct to signup
        await supabase.auth.signOut();
        return {
          success: false,
          message:
            "Please use the signup page to agree to our Terms of Service and Privacy Policy.",
          code: "TERMS_REQUIRED",
        };
      }
    }

    if (!data.session) {
      console.error(
        "[authService] signInWithGoogle: No session data received after Google Sign-In."
      );
      throw new Error("No session data received after Google Sign-In");
    }

    return { success: true };
  } catch (error) {
    return handleAuthError(error);
  }
};

// Unified social auth function for Apple
export const signInWithApple = async (): Promise<AuthResponse> => {
  try {
    const { data, displayName, avatarUrl } = await authenticateWithApple();

    // Always update basic metadata (display name and avatar)
    await updateUserMetadata(displayName, avatarUrl, false, "signInWithApple");

    // Check if user has accepted terms
    if (data.user) {
      try {
        const userProfile = await apiClient.getUserProfile(data.user.id);

        if (!userProfile.termsAccepted) {
          // Sign out the user and show guidance
          await supabase.auth.signOut();
          return {
            success: false,
            message:
              "Please use the signup page to agree to our Terms of Service and Privacy Policy.",
            code: "TERMS_REQUIRED",
          };
        }
      } catch {
        // If we can't get the profile, it might be a new user
        // Sign them out and direct to signup
        await supabase.auth.signOut();
        return {
          success: false,
          message:
            "Please use the signup page to agree to our Terms of Service and Privacy Policy.",
          code: "TERMS_REQUIRED",
        };
      }
    }

    if (!data.session) {
      console.error(
        "[authService] signInWithApple: No session data received after Apple Sign-In."
      );
      throw new Error("No session data received after Apple Sign-In");
    }

    return { success: true };
  } catch (error) {
    return handleAuthError(error);
  }
};

// Social auth for signup (sets terms_accepted: true)
export const signUpWithGoogle = async (): Promise<AuthResponse> => {
  try {
    const { displayName, avatarUrl } = await authenticateWithGoogle();
    await updateUserMetadata(displayName, avatarUrl, true, "signUpWithGoogle");
    return { success: true };
  } catch (error) {
    return handleAuthError(error);
  }
};

// Social auth for signup (sets terms_accepted: true)
export const signUpWithApple = async (): Promise<AuthResponse> => {
  try {
    const { displayName, avatarUrl } = await authenticateWithApple();
    await updateUserMetadata(displayName, avatarUrl, true, "signUpWithApple");
    return { success: true };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const signOut = async (): Promise<AuthResponse> => {
  try {
    // Get the current session to check the provider
    const { data: sessionData } = await supabase.auth.getSession();
    const provider = sessionData.session?.user?.app_metadata?.provider;

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }

    // Only attempt Google sign out if the user is signed in with Google
    if (provider === "google") {
      await handleGoogleSignOut();
    }

    const store = useUserStore.getState();
    store.logOut();
    store.setAuthenticated(false);
    return { success: true };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const resendOTP = async (email: string): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      throw error;
    }
    return {
      success: true,
      message: "A new verification code has been sent to your email.",
    };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const updateProfile = async (
  currentPassword: string | undefined,
  updates: {
    displayName?: string;
    avatarUrl?: string;
  }
): Promise<AuthResponse> => {
  try {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError) {
      throw sessionError;
    }
    if (!sessionData.session?.user) {
      throw new Error("No active session");
    }

    const provider = sessionData.session.user.app_metadata?.provider || "email";

    // Validate current password for email users
    if (provider === "email") {
      if (!currentPassword) {
        return {
          success: false,
          message: "Current password is required for email users",
        };
      }

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: sessionData.session.user.email!,
        password: currentPassword,
      });

      if (signInError) {
        return {
          success: false,
          message: "Current password is incorrect",
        };
      }
    }

    // Define the mapping between our update fields and Supabase fields
    const updateData = {
      display_name: updates.displayName,
      avatar_url: updates.avatarUrl,
    };

    // Remove any undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    // Update the Supabase auth user with the cleaned data
    const { data: userData, error: updateError } =
      await supabase.auth.updateUser({
        data: cleanedData,
      });

    if (updateError) {
      throw updateError;
    }
    if (!userData.user) {
      throw new Error("Failed to update user");
    }

    // After updating the user, get the current full session
    const { data: updatedSessionData, error: updatedSessionError } =
      await supabase.auth.getSession();
    if (updatedSessionError) {
      console.warn(
        "[AuthService] Could not get session after user update in updateProfile. This might be an issue if updateAuthState relies on it."
      );
      throw updatedSessionError;
    }
    if (!updatedSessionData.session) {
      console.warn(
        "[AuthService] No active session found after user update in updateProfile. This might be an issue if updateAuthState relies on it."
      );
      throw new Error("No active session after profile update.");
    }

    // Call updateAuthState with the full, current session
    await updateAuthState(updatedSessionData.session);

    return {
      success: true,
      message: "Profile updated successfully.",
    };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const updatePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<AuthResponse> => {
  try {
    // Get current user's email
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError) {
      throw sessionError;
    }
    if (!sessionData.session?.user?.email) {
      throw new Error("No active session or email");
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: sessionData.session.user.email,
      password: currentPassword,
    });

    if (signInError) {
      return {
        success: false,
        message: "Current password is incorrect",
      };
    }

    // If current password is verified, update to new password
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      throw error;
    }

    return { success: true, message: "Password updated successfully." };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const resetPassword = async (email: string): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: undefined,
    });
    if (error) {
      throw error;
    }
    return {
      success: true,
      message: "Password reset code sent. Please check your email.",
      code: "OTP_SENT",
      email,
    };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const verifyPasswordReset = async (
  email: string,
  token: string,
  newPassword: string
): Promise<AuthResponse> => {
  try {
    // First verify the OTP
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "recovery",
    });

    if (error) {
      if (
        error.message.includes("Invalid otp") ||
        error.message.includes("expired")
      ) {
        return {
          success: false,
          message:
            "Token has expired or is invalid. Please request a new code.",
        };
      }
      throw error;
    }

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return {
        success: false,
        message:
          "There was a problem updating your password. Please try again.",
      };
    }

    // Sign out after successful password reset
    await supabase.auth.signOut();

    // Log out from RevenueCat as well, since Supabase session is ended
    await RevenueCatService.safeLogout("password reset");

    return {
      success: true,
      message: "Password has been reset successfully. You can now log in.",
    };
  } catch (error) {
    return handleAuthError(error);
  }
};

// Re-authentication helpers that don't update auth state
const reAuthenticateWithGoogle = async (): Promise<AuthResponse> => {
  try {
    await GoogleSignin.hasPlayServices();
    const { idToken } = await GoogleSignin.signIn();
    if (!idToken) {
      throw new Error("Failed to authenticate with Google");
    }
    return { success: true };
  } catch {
    return {
      success: false,
      message: "Failed to verify Google account",
    };
  }
};

const reAuthenticateWithApple = async (): Promise<AuthResponse> => {
  try {
    await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    return { success: true };
  } catch {
    return {
      success: false,
      message: "Failed to verify Apple ID",
    };
  }
};

export const deleteAccount = async (
  password?: string
): Promise<AuthResponse> => {
  try {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      return handleAuthError(new Error("No active session"));
    }

    const { user } = session.data.session;
    const provider = user.app_metadata.provider;

    // Re-authenticate based on provider
    if (provider === "email") {
      if (!password) {
        return handleAuthError(
          new Error("Password is required for account deletion")
        );
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password,
      });

      if (error) {
        return handleAuthError(error);
      }
    } else if (provider === "google") {
      const authResponse = await reAuthenticateWithGoogle();
      if (!authResponse.success) {
        return handleAuthError(
          new Error("Please verify your Google account before deletion")
        );
      }
    } else if (provider === "apple") {
      const authResponse = await reAuthenticateWithApple();
      if (!authResponse.success) {
        return handleAuthError(
          new Error("Please verify your Apple ID before deletion")
        );
      }
    }

    // Delete user RPC function
    const { error: deleteError } = await supabase.rpc("delete_user");
    if (deleteError) {
      return handleAuthError(deleteError);
    }

    // Return success with cleanup function
    return {
      success: true,
      message: "Your account has been successfully deleted.",
      cleanup: async () => {
        if (provider === "google") {
          await handleGoogleSignOut();
        }
        // Log out from RevenueCat before clearing Supabase session and local store
        await RevenueCatService.safeLogout("account deletion cleanup");
        await useUserStore.getState().logOut();
        await supabase.auth.signOut();
      },
    };
  } catch (error) {
    return handleAuthError(error);
  }
};
