import { useState, useCallback } from "react";
import { useAppDispatch } from "../store/hooks";
import { AuthErrorMessages } from "../features/auth/utilities/AuthErrorMessages";
import { useRouter } from "expo-router";
import {
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  sendPasswordResetEmail,
  updateUserProfile,
  sendEmailVerification,
  updateUserPassword,
  deleteUser,
  reauthenticateUser,
} from "@features/auth/services/FirebaseAuthService";
import { signInWithGoogle } from "@features/auth/services/GoogleAuthService";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";

export const useAuthMethods = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleAction = useCallback(
    async (
      action: () => Promise<void>,
      successMsg: string,
      successPath?: string
    ) => {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      try {
        await action();
        setSuccessMessage(successMsg);
        if (successPath) {
          // Navigate on successful action
          router.replace(successPath);
        }
      } catch (error: any) {
        console.error(error);
        setError(
          AuthErrorMessages.getErrorMessage(error.code) ||
            error.message ||
            "An unexpected error occurred."
        );
      } finally {
        setLoading(false);
      }
    },
    [router] // Depend on router to ensure it's captured in the hook's closure
  );

  return {
    handleSignUpWithEmail: (email: string, password: string) =>
      handleAction(
        () => signUpWithEmail(email, password, dispatch),
        "Signed up successfully.",
        "/dashboard"
      ),
    handleLoginWithEmail: (email: string, password: string) =>
      handleAction(
        () => signInWithEmail(email, password, dispatch),
        "Logged in successfully.",
        "/dashboard"
      ),
    handleLoginWithGoogle: () =>
      handleAction(
        () => signInWithGoogle(dispatch),
        "Logged in with Google successfully.",
        "/dashboard"
      ),
    handleSignOut: () =>
      handleAction(
        () => signOutUser(dispatch),
        "Signed out successfully.",
        "/"
      ),
    handlePasswordReset: (email: string) =>
      handleAction(
        () => sendPasswordResetEmail(email),
        "Password reset email sent. Please check your inbox."
      ),
    handleUpdateUserProfile: (updates: {
      displayName?: string;
      photoURL?: string;
    }) =>
      handleAction(
        () => updateUserProfile(updates, dispatch),
        "Profile updated successfully."
      ),
    handleSendEmailVerification: () =>
      handleAction(
        () => sendEmailVerification(),
        "Verification email sent. Please check your inbox."
      ),
    handleUpdateUserPassword: (newPassword: string) =>
      handleAction(
        () => updateUserPassword(newPassword, dispatch),
        "Password updated successfully."
      ),
    handleDeleteUserAccount: () =>
      handleAction(() => deleteUser(dispatch), "Account deleted successfully."),
    handleReauthenticateUser: (credential: FirebaseAuthTypes.AuthCredential) =>
      handleAction(
        () => reauthenticateUser(credential, dispatch),
        "User re-authenticated successfully."
      ),
    loading,
    error,
    successMessage,
  };
};
