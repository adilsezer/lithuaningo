import { useUserStore } from "@stores/useUserStore";
import { useRouter } from "expo-router";
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signInWithApple,
  signOut,
  updateProfile,
  updatePassword,
  resetPassword,
  deleteAccount,
} from "@services/auth/authService";
import { useAuthOperation } from "./useAuthOperation";
import { useAlertDialog } from "@hooks/useAlertDialog";
import { useCallback } from "react";
import { Platform } from "react-native";

export type SocialProvider = "google" | "apple";

export const useAuth = () => {
  const router = useRouter();
  const { performAuthOperation } = useAuthOperation();
  const { showAlert } = useAlertDialog();

  // Navigation helpers
  const navigateAfterAuth = useCallback(
    (route: string) => {
      router.replace(route);
    },
    [router]
  );

  // Authentication methods
  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const result = await performAuthOperation(async () => {
        const response = await signUpWithEmail(email, password, name);
        if (response.success) {
          // crashlytics().log("User signed up successfully");
          showAlert({
            title: "Verification Email Sent",
            message:
              "Please check your email to verify your account before logging in.",
            buttons: [
              { text: "OK", onPress: () => navigateAfterAuth("/auth/login") },
            ],
          });
        }
        return response;
      }, "Sign Up Failed");
      return result;
    },
    [performAuthOperation, navigateAfterAuth]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await performAuthOperation(async () => {
        const response = await signInWithEmail(email, password);
        if (response.success) {
          // crashlytics().log("User signed in with email");
          navigateAfterAuth("/dashboard");
        }
        return response;
      }, "Login Failed");
      return result;
    },
    [performAuthOperation, navigateAfterAuth]
  );

  const signInWithSocial = useCallback(
    async (provider: SocialProvider) => {
      const result = await performAuthOperation(async () => {
        let response;
        if (provider === "google") {
          response = await signInWithGoogle();
        } else if (provider === "apple" && Platform.OS === "ios") {
          response = await signInWithApple();
        } else {
          throw new Error(`Unsupported provider: ${provider}`);
        }

        if (response.success) {
          // crashlytics().log(`User signed in with ${provider}`);
          navigateAfterAuth("/dashboard");
        }
        return response;
      }, `${provider} Login Failed`);
      return result;
    },
    [performAuthOperation, navigateAfterAuth]
  );

  const handleSignOut = useCallback(async () => {
    const result = await performAuthOperation(async () => {
      const response = await signOut();
      if (response.success) {
        // crashlytics().log("User signed out");
        navigateAfterAuth("/");
      }
      return response;
    }, "Sign Out Failed");
    return result;
  }, [performAuthOperation, navigateAfterAuth]);

  // Profile management
  const handleUpdateProfile = useCallback(
    async (currentPassword: string, updates: any) => {
      const result = await performAuthOperation(async () => {
        const response = await updateProfile(currentPassword, updates);
        if (response.success) {
          // crashlytics().log("User profile updated");
          navigateAfterAuth("/dashboard/profile");
        }
        return response;
      }, "Profile Update Failed");
      return result;
    },
    [performAuthOperation, navigateAfterAuth]
  );

  const handleUpdatePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const result = await performAuthOperation(async () => {
        const response = await updatePassword(currentPassword, newPassword);
        if (response.success) {
          // crashlytics().log("User password updated");
          navigateAfterAuth("/dashboard/profile");
        }
        return response;
      }, "Password Update Failed");
      return result;
    },
    [performAuthOperation, navigateAfterAuth]
  );

  const handleResetPassword = useCallback(
    async (email: string) => {
      const result = await performAuthOperation(async () => {
        const response = await resetPassword(email);
        if (response.success) {
          // crashlytics().log("Password reset email sent");
          navigateAfterAuth("/auth/login");
        }
        return response;
      }, "Password Reset Failed");
      return result;
    },
    [performAuthOperation, navigateAfterAuth]
  );

  // Account management
  const handleDeleteAccount = useCallback(async () => {
    const result = await performAuthOperation(async () => {
      const response = await deleteAccount();
      if (response.success) {
        // crashlytics().log("User account deleted");
        navigateAfterAuth("/");
      }
      return response;
    }, "Account Deletion Failed");
    return result;
  }, [performAuthOperation, navigateAfterAuth]);

  return {
    signUp,
    signIn,
    signInWithSocial,
    signOut: handleSignOut,
    updateProfile: handleUpdateProfile,
    updatePassword: handleUpdatePassword,
    resetPassword: handleResetPassword,
    deleteAccount: handleDeleteAccount,
  };
};
