import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { useUserStore } from "@stores/useUserStore";
import apiClient from "@services/api/apiClient";
import Constants from "expo-constants";
import { getErrorMessage } from "@utils/errorMessages";
import { supabase } from "@services/supabase/supabaseClient";
import { User } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: Constants.expoConfig?.extra?.googleWebClientId,
  iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
  offlineAccess: true,
});

interface AuthResponse {
  success: boolean;
  message?: string;
}

interface ProfileUpdateData {
  displayName?: string;
  email?: string;
}

// Helper Functions
const handleAuthError = (error: any): AuthResponse => {
  console.error("Auth operation failed:", error);

  // Handle specific Supabase error codes
  if (error.message?.includes("Email not confirmed")) {
    return {
      success: false,
      message: "Please verify your email address before signing in.",
    };
  }

  return {
    success: false,
    message: getErrorMessage(error) || "Authentication failed",
  };
};

const updateEmailVerificationStatus = async (
  userId: string,
  email: string,
  emailVerified: boolean
) => {
  try {
    const userProfile = await apiClient.getUserProfile(userId);
    if (userProfile && userProfile.emailVerified !== emailVerified) {
      await apiClient.updateUserProfile({
        ...userProfile,
        emailVerified,
      });
    }
  } catch (error) {
    console.error("Error updating email verification status:", error);
  }
};

export const updateUserState = async (session: { user: User } | null) => {
  if (!session?.user?.email) {
    throw new Error("User email is unexpectedly null or undefined.");
  }

  const { user } = session;
  const emailVerified = user.email_confirmed_at != null;

  // Handle email verification
  if (!user.email || !emailVerified) {
    await supabase.auth.signOut();
    useUserStore.getState().logOut();
    throw new Error("Email does not exist or is not verified");
  }

  // Update user state only if email is verified
  useUserStore.getState().logIn({
    id: user.id,
    name: user.user_metadata?.name || "No Name",
    email: user.email,
    emailVerified,
  });

  await updateEmailVerificationStatus(user.id, user.email, emailVerified);
};

const ensureUserProfile = async (
  userId: string,
  email: string,
  name: string
) => {
  const userProfile = await apiClient.getUserProfile(userId);
  if (!userProfile) {
    await apiClient.createUserProfile(userId);
    const newUserProfile = await apiClient.getUserProfile(userId);
    newUserProfile.name = name || "No Name";
    newUserProfile.email = email;
    newUserProfile.emailVerified = true;
    await apiClient.updateUserProfile(newUserProfile);
  }
};

// Auth Functions
export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      await ensureUserProfile(data.user.id, email, name);
    }

    return {
      success: true,
      message: "Registration successful! Please verify your email to continue.",
    };
  } catch (error) {
    return handleAuthError(error);
  }
};

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
    // Reset attempts after lockout period
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

  const newData = {
    count: attemptsData.count + 1,
    timestamp: Date.now(),
  };

  await AsyncStorage.setItem(AUTH_ATTEMPT_KEY, JSON.stringify(newData));
};

const resetAuthAttempts = async () => {
  await AsyncStorage.setItem(
    AUTH_ATTEMPT_KEY,
    JSON.stringify({ count: 0, timestamp: 0 })
  );
};

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    await checkAuthAttempts(); // Check attempts before sign in

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      await incrementAuthAttempts(); // Increment on failure
      throw error;
    }

    if (!data.user.email_confirmed_at) {
      await incrementAuthAttempts(); // Increment on unverified email
      await supabase.auth.signOut();
      return {
        success: false,
        message: "Please verify your email before logging in.",
      };
    }

    await resetAuthAttempts(); // Reset on successful login
    await ensureUserProfile(
      data.user.id,
      data.user.email || "",
      data.user.user_metadata?.name || ""
    );
    await updateUserState(data.session);
    return { success: true };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const signInWithGoogle = async (): Promise<AuthResponse> => {
  try {
    await checkAuthAttempts(); // Check attempts before sign in

    await GoogleSignin.hasPlayServices();
    const { idToken } = await GoogleSignin.signIn();

    if (!idToken) {
      await incrementAuthAttempts(); // Increment on failure
      throw new Error("Failed to get ID token from Google Sign-In");
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });

    if (error) {
      await incrementAuthAttempts(); // Increment on failure
      throw error;
    }

    await resetAuthAttempts(); // Reset on successful login
    await ensureUserProfile(
      data.user.id,
      data.user.email || "",
      data.user.user_metadata?.name || ""
    );
    await updateUserState(data.session);
    return { success: true };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const signInWithApple = async (): Promise<AuthResponse> => {
  try {
    await checkAuthAttempts(); // Check attempts before sign in

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      await incrementAuthAttempts(); // Increment on failure
      throw new Error("No identity token");
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: credential.identityToken,
    });

    if (error) {
      await incrementAuthAttempts(); // Increment on failure
      throw error;
    }

    await resetAuthAttempts(); // Reset on successful login
    await ensureUserProfile(
      data.user.id,
      data.user.email || "",
      data.user.user_metadata?.name || credential.fullName?.givenName || ""
    );
    await updateUserState(data.session);
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

    useUserStore.getState().logOut();
    return { success: true };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const updateProfile = async (
  currentPassword: string,
  updates: ProfileUpdateData
): Promise<AuthResponse> => {
  try {
    if (updates.email) {
      const { error } = await supabase.auth.updateUser({
        email: updates.email,
      });
      if (error) throw error;
    }

    if (updates.displayName) {
      const { error } = await supabase.auth.updateUser({
        data: { name: updates.displayName },
      });
      if (error) throw error;
    }

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    await updateUserState(sessionData.session);
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

    if (!sessionData.session?.user) {
      throw new Error("No active session");
    }

    // Note: This requires admin privileges and should be done through your backend
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
