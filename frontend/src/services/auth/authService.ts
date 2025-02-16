import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { useUserStore } from "@stores/useUserStore";
import apiClient from "@services/api/apiClient";
import Constants from "expo-constants";
import { getErrorMessage } from "@utils/errorMessages";
import { supabase } from "@services/supabase/supabaseClient";
import { User } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AUTH_PATTERNS } from "@utils/validationPatterns";
import { AuthResponse } from "@src/types/auth.types";

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: Constants.expoConfig?.extra?.googleWebClientId,
  iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
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

  const name = user.user_metadata?.name;
  if (!name || typeof name !== "string") {
    console.error(
      "[Auth] Invalid or missing name in metadata:",
      user.user_metadata
    );
    throw new Error("User name is required and must be a string");
  }

  const userData = {
    id: user.id,
    email: user.email,
    fullName: name,
    emailVerified: user.email_confirmed_at !== null,
    isAdmin: false,
    isPremium: false,
    premiumExpiresAt: undefined,
  };

  useUserStore.getState().logIn(userData);
  useUserStore.getState().setAuthenticated(true);
  await ensureUserProfile(user.id, user.email, name);
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

const ensureUserProfile = async (
  userId: string,
  email: string,
  name: string
) => {
  try {
    try {
      await apiClient.getUserProfile(userId);
      return true;
    } catch (error: any) {
      if (error?.status === 404) {
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
        return true;
      }
      throw error;
    }
  } catch (error: any) {
    console.error("[Auth] Profile error:", error);
    throw new Error("Failed to create or update user profile");
  }
};

// Auth rate limiting
const AUTH_ATTEMPT_KEY = "auth_attempts";
const MAX_AUTH_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const checkAuthAttempts = async () => {
  const attempts = await AsyncStorage.getItem(AUTH_ATTEMPT_KEY);
  const attemptsData = attempts
    ? JSON.parse(attempts)
    : { count: 0, timestamp: 0 };

  if (attemptsData.count >= MAX_AUTH_ATTEMPTS) {
    const timePassed = Date.now() - attemptsData.timestamp;
    if (timePassed < LOCKOUT_DURATION) {
      throw new Error("Too many login attempts. Please try again later.");
    }
    await AsyncStorage.setItem(
      AUTH_ATTEMPT_KEY,
      JSON.stringify({ count: 0, timestamp: 0 })
    );
  }
};

const incrementAuthAttempts = async () => {
  const attempts = await AsyncStorage.getItem(AUTH_ATTEMPT_KEY);
  const attemptsData = attempts
    ? JSON.parse(attempts)
    : { count: 0, timestamp: 0 };
  await AsyncStorage.setItem(
    AUTH_ATTEMPT_KEY,
    JSON.stringify({
      count: attemptsData.count + 1,
      timestamp: Date.now(),
    })
  );
};

const resetAuthAttempts = async () => {
  await AsyncStorage.setItem(
    AUTH_ATTEMPT_KEY,
    JSON.stringify({ count: 0, timestamp: 0 })
  );
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
      options: { data: { name } },
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
      const name = verifyData.user.user_metadata?.name;
      if (!name) throw new Error("Name is required");
      await ensureUserProfile(verifyData.user.id, email, name);
    }

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
    await checkAuthAttempts();

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
      await incrementAuthAttempts();
      throw error;
    }

    if (!data.user) throw new Error("No user data received");

    await resetAuthAttempts();
    await updateAuthState(data.session);
    return { success: true, message: "Successfully logged in" };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const signInWithGoogle = async (): Promise<AuthResponse> => {
  try {
    await checkAuthAttempts();
    const { idToken } = await GoogleSignin.signIn();
    if (!idToken) throw new Error("Failed to get ID token from Google Sign-In");

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });

    if (error) {
      await incrementAuthAttempts();
      throw error;
    }

    await resetAuthAttempts();
    await updateAuthState(data.session);
    return { success: true };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const signInWithApple = async (): Promise<AuthResponse> => {
  try {
    await checkAuthAttempts();
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken)
      throw new Error("No identity token from Apple Sign-In");

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: credential.identityToken,
    });

    if (error) {
      await incrementAuthAttempts();
      throw error;
    }

    await resetAuthAttempts();
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
  currentPassword: string,
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
    if (updates.email) {
      const { error } = await supabase.auth.updateUser({
        email: updates.email,
      });
      if (error) throw error;
    }

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!sessionData.session?.user) throw new Error("No active session");

    const userId = sessionData.session.user.id;
    const userProfile = await apiClient.getUserProfile(userId);

    if (!userProfile) throw new Error("User profile not found");

    await apiClient.updateUserProfile(userId, {
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
      message: updates.email
        ? "Profile updated. Please verify your new email address."
        : "Profile updated successfully.",
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
      redirectTo: `${Constants.expoConfig?.scheme}://auth-callback`,
    });
    if (error) throw error;
    return {
      success: true,
      message: "Password reset email sent. Please check your inbox.",
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

    await apiClient.deleteUserProfile(sessionData.session.user.id);
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
