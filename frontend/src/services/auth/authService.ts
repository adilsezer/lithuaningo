import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { useUserStore } from "@stores/useUserStore";
import { getErrorMessage } from "@utils/errorMessages";
import { supabase } from "@services/supabase/supabaseClient";
import { User } from "@supabase/supabase-js";
import { AUTH_PATTERNS } from "@utils/validationPatterns";
import { AuthResponse } from "@src/types/auth.types";
import userProfileService from "@services/data/userProfileService";

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

  const name = user.user_metadata?.display_name || "No Name";
  if (typeof name !== "string") {
    console.error("[Auth] Invalid name type in metadata:", user.user_metadata);
    throw new Error("User name must be a string");
  }

  const userData = {
    id: user.id,
    email: user.email,
    fullName: name,
    emailVerified: user.email_confirmed_at !== null,
    isAdmin: false,
    isPremium: false,
    premiumExpiresAt: undefined,
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
          display_name: name,
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
    const { idToken } = await GoogleSignin.signIn();

    if (!idToken) {
      throw new Error("Failed to get ID token from Google Sign-In");
    }

    // Sign in with Supabase using the Google ID token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });

    if (error) {
      throw error;
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

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: credential.identityToken,
    });

    if (error) {
      throw error;
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
    email?: string;
    emailVerified?: boolean;
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

    const userId = sessionData.session.user.id;
    const userProfile = await userProfileService.fetchUserProfile(userId);

    if (!userProfile) throw new Error("User profile not found");

    // Update the profile
    await userProfileService.updateUserProfile(userId, {
      email: updates.email || userProfile.email,
      emailVerified: updates.emailVerified ?? userProfile.emailVerified,
      fullName: updates.displayName || userProfile.fullName,
      avatarUrl: updates.avatarUrl ?? userProfile.avatarUrl,
      isAdmin: updates.isAdmin ?? userProfile.isAdmin,
      isPremium: updates.isPremium ?? userProfile.isPremium,
      premiumExpiresAt:
        updates.premiumExpiresAt ?? userProfile.premiumExpiresAt,
    });

    await updateAuthState(sessionData.session);
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

export const deleteAccount = async (): Promise<AuthResponse> => {
  try {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!sessionData.session?.user) throw new Error("No active session");

    await userProfileService.deleteUserProfile(sessionData.session.user.id);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    const store = useUserStore.getState();
    store.deleteAccount();
    store.logOut();

    return { success: true, message: "Account deleted successfully." };
  } catch (error) {
    return handleAuthError(error);
  }
};
