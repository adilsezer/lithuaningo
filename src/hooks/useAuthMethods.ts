import { useCallback } from "react";
import { useAppDispatch } from "../redux/hooks";
import { getErrorMessage } from "../utils/errorMessages";
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
} from "@src/services/FirebaseAuthService";
import { signInWithGoogle } from "@src/services/GoogleAuthService";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";

export const useAuthMethods = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleAction = useCallback(
    async (action: () => Promise<void>, successPath?: string) => {
      try {
        await action();
        if (successPath) {
          router.replace(successPath);
        }
        return { success: true };
      } catch (error: any) {
        return {
          success: false,
          message: error.code ? getErrorMessage(error.code) : error.message,
        };
      }
    },
    [router, dispatch]
  );

  return {
    handleSignUpWithEmail: async (
      email: string,
      password: string,
      name: string
    ) => {
      const action = async () => {
        await signUpWithEmail(email, password, dispatch);
        await updateUserProfile(
          {
            displayName: name,
          },
          dispatch
        );
        await sendEmailVerification();
      };
      const result = await handleAction(action, "/auth/login");
      if (result.success) {
        result.message =
          "Registration successful! Please verify your email to continue.";
      }
      return result;
    },
    handleLoginWithEmail: async (email: string, password: string) => {
      return await handleAction(
        () => signInWithEmail(email, password, dispatch),
        "/dashboard"
      );
    },
    handleLoginWithGoogle: async () => {
      return await handleAction(() => signInWithGoogle(dispatch), "/dashboard");
    },
    handleSignOut: async () => {
      return await handleAction(() => signOutUser(dispatch), "/");
    },
    handlePasswordReset: async (email: string) => {
      const result = await handleAction(
        () => sendPasswordResetEmail(email),
        "/auth/login"
      );
      if (result.success) {
        result.message = "Password reset email sent. Please check your inbox.";
      }
      return result;
    },
    handleUpdateUserProfile: async (updates: {
      displayName?: string;
      photoURL?: string;
    }) => {
      const result = await handleAction(() =>
        updateUserProfile(updates, dispatch)
      );
      if (result.success) {
        result.message = "Profile updated successfully.";
      }
      return result;
    },
    handleSendEmailVerification: async () => {
      const result = await handleAction(sendEmailVerification);
      if (result.success) {
        result.message = "Verification email sent. Please check your inbox.";
      }
      return result;
    },
    handleUpdateUserPassword: async (newPassword: string) => {
      const result = await handleAction(() =>
        updateUserPassword(newPassword, dispatch)
      );
      if (result.success) {
        result.message = "Password updated successfully.";
      }
      return result;
    },
    handleDeleteUserAccount: async () => {
      const result = await handleAction(() => deleteUser(dispatch));
      if (result.success) {
        result.message = "Account deleted successfully.";
      }
      return result;
    },
    handleReauthenticateUser: async (
      credential: FirebaseAuthTypes.AuthCredential
    ) => {
      const result = await handleAction(() =>
        reauthenticateUser(credential, dispatch)
      );
      if (result.success) {
        result.message = "User re-authenticated successfully.";
      }
      return result;
    },
  };
};
