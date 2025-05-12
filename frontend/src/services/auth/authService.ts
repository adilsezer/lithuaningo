import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { useUserStore } from "@stores/useUserStore";
import { getErrorMessage } from "@utils/errorMessages";
import { supabase } from "@services/supabase/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { AUTH_PATTERNS } from "@utils/validationPatterns";
import { AuthResponse } from "@src/types/auth.types";
import { generateAnonymousName } from "@utils/userUtils";
import Purchases from "react-native-purchases";
import { apiClient } from "../api/apiClient";

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  offlineAccess: true,
});

// Auth state management
export const updateAuthState = async (session: Session | null) => {
  if (!session?.user) {
    console.error("[Auth] No user in session or session is null");
    useUserStore.getState().logOut();
    useUserStore.getState().setAuthenticated(false);
    try {
      await Purchases.logOut();
    } catch (rcError) {
      console.warn(
        "[Auth] Failed to logOut from RevenueCat on null session:",
        rcError
      );
    }
    return;
  }

  const { user } = session;
  if (!user.email) {
    console.error("[Auth] No email in user data");
    throw new Error("User email is unexpectedly null or undefined.");
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
    };

    useUserStore.getState().logIn(userData);
    useUserStore.getState().setAuthenticated(true);

    if (session?.access_token) {
      console.log("[DEBUG] Supabase JWT access token:", session.access_token);
    }

    await Purchases.logIn(user.id);
  } catch (error) {
    console.error(
      "[Auth] Failed to fetch user profile or log in to RevenueCat:",
      error
    );
    useUserStore.getState().logOut();
    useUserStore.getState().setAuthenticated(false);
    try {
      await Purchases.logOut();
    } catch (rcError) {
      /* Ignore secondary error */
    }
    throw new Error(
      `Failed to initialize user session: ${getErrorMessage(
        error instanceof Error ? error.message : String(error)
      )}`
    );
  }
};

// Helper Functions
const handleAuthError = (error: any): AuthResponse => {
  console.error("Auth operation failed:", error);

  if (error.message?.includes("Email not confirmed")) {
    return {
      success: false,
      message: "Please verify your email before logging in.",
      code: "EMAIL_NOT_VERIFIED",
      email: error.email,
    };
  }

  return {
    success: false,
    message: getErrorMessage(error) || "Authentication failed",
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
        },
      },
    });

    if (error) throw error;

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
  try {
    const { data: verifyData, error: verifyError } =
      await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      });

    if (verifyError) throw verifyError;

    if (verifyData.user) {
      const name = verifyData.user.user_metadata?.display_name;
      if (!name) throw new Error("Name is required");
    }

    // Sign out after successful email verification
    await supabase.auth.signOut();

    return {
      success: true,
      message: "Email verified successfully! You can now log in.",
    };
  } catch (error) {
    return handleAuthError(error);
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
      throw error;
    }

    if (!data.user || !data.session) throw new Error("No user data received");

    await updateAuthState(data.session);
    return { success: true, message: "Successfully logged in" };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const signInWithGoogle = async (): Promise<AuthResponse> => {
  try {
    // Sign in with Google
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens();

    if (!userInfo.idToken) {
      throw new Error("Failed to get ID token from Google Sign-In");
    }

    // Sign in with Supabase using the Google ID token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: userInfo.idToken,
      access_token: tokens.accessToken,
    });

    if (error) throw error;

    // Check if we have user data
    if (!data.user || !data.session) {
      throw new Error("No user data received from authentication");
    }

    // Update user metadata with a properly formatted display name
    const displayName =
      userInfo.user.name ||
      data.user.user_metadata?.name ||
      generateAnonymousName(data.user.id);

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        display_name: displayName,
        avatar_url: userInfo.user.photo || "",
      },
    });

    if (updateError) {
      console.error("Failed to update user metadata:", updateError);
    }

    // Ensure session is passed to updateAuthState
    if (!data.session) {
      throw new Error("No session data received after Google Sign-In");
    }
    await updateAuthState(data.session);
    return { success: true };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const signInWithApple = async (): Promise<AuthResponse> => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error("No identity token from Apple Sign-In");
    }

    // Sign in with Supabase using the Apple ID token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: credential.identityToken,
      access_token: credential.authorizationCode || undefined,
    });

    if (error) throw error;

    // Check if we have user data
    if (!data.user || !data.session) {
      throw new Error("No user data received from authentication");
    }

    // Update user metadata with a properly formatted display name
    const displayName =
      (credential.fullName?.givenName && credential.fullName?.familyName
        ? `${credential.fullName.givenName} ${credential.fullName.familyName}`.trim()
        : null) ||
      data.user.user_metadata?.display_name ||
      data.user.user_metadata?.name ||
      generateAnonymousName(data.user.id);

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        display_name: displayName,
        avatar_url: data.user.user_metadata?.avatar_url || "",
      },
    });

    if (updateError) {
      console.error("Failed to update user metadata:", updateError);
    }

    // Ensure session is passed to updateAuthState
    if (!data.session) {
      throw new Error("No session data received after Apple Sign-In");
    }
    await updateAuthState(data.session);
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
    if (error) throw error;

    // Only attempt Google sign out if the user is signed in with Google
    if (provider === "google") {
      try {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn) {
          await GoogleSignin.revokeAccess();
          await GoogleSignin.signOut();
        }
      } catch (googleError) {
        console.error("Google sign out error:", googleError);
      }
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

    if (error) throw error;
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
    if (sessionError) throw sessionError;
    if (!sessionData.session?.user) throw new Error("No active session");

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

    if (updateError) throw updateError;
    if (!userData.user) throw new Error("Failed to update user");

    // After updating the user, get the current full session
    const { data: updatedSessionData, error: updatedSessionError } =
      await supabase.auth.getSession();
    if (updatedSessionError) {
      console.warn("Could not get session after user update in updateProfile");
      throw updatedSessionError;
    }
    if (!updatedSessionData.session) {
      console.warn(
        "No active session found after user update in updateProfile"
      );
      // Decide if this is an error or if user might have been logged out by another action
      // For now, we'll proceed as if it's an error for updateAuthState to expect a session
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
    if (sessionError) throw sessionError;
    if (!sessionData.session?.user?.email)
      throw new Error("No active session or email");

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
    if (error) throw error;

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
    if (error) throw error;
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
    try {
      await Purchases.logOut();
    } catch (rcError) {
      console.error(
        "[Auth] Failed to logOut from RevenueCat after password reset:",
        rcError
      );
    }

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
  } catch (error) {
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
  } catch (error) {
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
          try {
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut();
          } catch (error) {
            console.error("Error revoking Google access:", error);
          }
        }
        // Log out from RevenueCat before clearing Supabase session and local store
        await useUserStore.getState().logOut();
        await supabase.auth.signOut();
      },
    };
  } catch (error) {
    return handleAuthError(error);
  }
};
