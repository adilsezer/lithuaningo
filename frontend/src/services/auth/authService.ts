import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { useUserStore } from "@stores/useUserStore";
import { getErrorMessage } from "@utils/errorMessages";
import { supabase } from "@services/supabase/supabaseClient";
import { User } from "@supabase/supabase-js";
import { AUTH_PATTERNS } from "@utils/validationPatterns";
import { AuthResponse } from "@src/types/auth.types";
import { generateAnonymousName } from "@utils/userUtils";

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  offlineAccess: true,
});

// Auth state management
export const updateAuthState = async (session: { user: User } | null) => {
  if (!session?.user) {
    console.error("[Auth] No user in session");
    throw new Error("User is unexpectedly null or undefined.");
  }

  const { user } = session;
  if (!user.email) {
    console.error("[Auth] No email in user data");
    throw new Error("User email is unexpectedly null or undefined.");
  }

  // Get display name from various possible locations in metadata
  const displayName =
    user.user_metadata?.display_name ||
    user.user_metadata?.name ||
    generateAnonymousName(user.id);

  const userData = {
    id: user.id,
    email: user.email,
    fullName: displayName,
    emailVerified: user.email_confirmed_at !== null,
    isAdmin: user.user_metadata?.is_admin || false,
    isPremium: user.user_metadata?.is_premium || false,
    premiumExpiresAt: user.user_metadata?.premium_expires_at,
    authProvider: user.app_metadata?.provider || "email",
  };

  useUserStore.getState().logIn(userData);
  useUserStore.getState().setAuthenticated(true);
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
          premium_expires_at: null,
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

    if (!data.user) throw new Error("No user data received");

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

    await updateAuthState(data.session);
    return { success: true };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const signOut = async (): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      }
    } catch (googleError) {
      console.error("Google sign out error:", googleError);
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
    isAdmin?: boolean;
    isPremium?: boolean;
    premiumExpiresAt?: string;
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
      is_admin: updates.isAdmin,
      is_premium: updates.isPremium,
      premium_expires_at: updates.premiumExpiresAt,
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

    await updateAuthState({ user: userData.user });
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

export const deleteAccount = async (): Promise<AuthResponse> => {
  try {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!sessionData.session?.user) throw new Error("No active session");

    // Re-authenticate based on provider
    const provider = sessionData.session.user.app_metadata?.provider;
    if (provider) {
      let authResponse: AuthResponse;

      if (provider === "google") {
        authResponse = await reAuthenticateWithGoogle();
      } else if (provider === "apple") {
        authResponse = await reAuthenticateWithApple();
      } else {
        authResponse = { success: true };
      }

      if (!authResponse.success) {
        return {
          success: false,
          message: `Please verify your ${provider} account before deleting`,
        };
      }
    }

    // Delete the user using a Supabase RPC function
    const { error: deleteError } = await supabase.rpc("delete_user");
    if (deleteError) throw deleteError;

    // Return success first
    const response: AuthResponse = {
      success: true,
      message:
        "Your account has been successfully deleted. We're sorry to see you go.",
    };

    // Schedule cleanup to run after response is handled
    setTimeout(async () => {
      try {
        await supabase.auth.signOut();
        const store = useUserStore.getState();
        store.deleteAccount();
        store.logOut();
      } catch (error) {
        console.error("Error during cleanup:", error);
      }
    }, 1000);

    return response;
  } catch (error) {
    return handleAuthError(error);
  }
};
