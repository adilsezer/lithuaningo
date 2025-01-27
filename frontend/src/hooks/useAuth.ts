import { useUserStore } from "@stores/useUserStore";
import { useRouter } from "expo-router";
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithSocialProvider,
  signOut,
  updateProfile,
  updatePassword,
  resetPassword,
  deleteAccount,
  reauthenticateUser,
} from "@services/auth/authService";
import { useAuthOperation } from "./useAuthOperation";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import crashlytics from "@react-native-firebase/crashlytics";
import auth from "@react-native-firebase/auth";
import apiClient from "@src/services/api/apiClient";
import { useAlertDialog } from "@components/ui/AlertDialog";
import { useCallback } from "react";

export type SocialProvider = "google" | "apple";

export const useAuth = () => {
  const router = useRouter();
  const { performAuthOperation, error, clearError } = useAuthOperation();
  const alertDialog = useAlertDialog();
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
          crashlytics().log("User signed up successfully");
          alertDialog.show({
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
          crashlytics().log("User signed in with email");
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
        const response = await signInWithSocialProvider(provider);
        if (response.success) {
          crashlytics().log(`User signed in with ${provider}`);
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
        crashlytics().log("User signed out");
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
          crashlytics().log("User profile updated");
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
          crashlytics().log("User password updated");
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
          crashlytics().log("Password reset email sent");
          navigateAfterAuth("/auth/login");
        }
        return response;
      }, "Password Reset Failed");
      return result;
    },
    [performAuthOperation, navigateAfterAuth]
  );

  // Account management
  const handleDeleteAccount = useCallback(
    async (currentPassword?: string) => {
      const result = await performAuthOperation(async () => {
        const response = await deleteAccount(currentPassword);
        if (response.success) {
          const user = auth().currentUser;
          if (user) {
            crashlytics().log("User account deleted");
            await apiClient.deleteUserProfile(user.uid);
            navigateAfterAuth("/");
          }
        }
        return response;
      }, "Account Deletion Failed");
      return result;
    },
    [performAuthOperation, navigateAfterAuth]
  );

  const handleReauthenticate = useCallback(
    async (credential: FirebaseAuthTypes.AuthCredential) => {
      return await performAuthOperation(async () => {
        const response = await reauthenticateUser(credential);
        if (response.success) {
          crashlytics().log("User reauthenticated");
        }
        return response;
      }, "Reauthentication Failed");
    },
    [performAuthOperation]
  );

  return {
    // State
    error,

    // Actions
    clearError,
    signUp,
    signIn,
    signInWithSocial,
    signOut: handleSignOut,
    updateProfile: handleUpdateProfile,
    updatePassword: handleUpdatePassword,
    resetPassword: handleResetPassword,
    deleteAccount: handleDeleteAccount,
    reauthenticate: handleReauthenticate,
  };
};
