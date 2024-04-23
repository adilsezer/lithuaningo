import { useCallback } from "react";
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
import { setLoading, setMessage } from "@features/ui/redux/uiSlice";

export const useAuthMethods = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleAction = useCallback(
    async (
      action: () => Promise<void>,
      successMsg: string,
      successPath?: string
    ) => {
      dispatch(setLoading(true));
      try {
        await action();
        dispatch(setMessage({ message: successMsg, type: "success" }));
        if (successPath) {
          router.replace(successPath);
        }
      } catch (error: any) {
        const formattedMessage = AuthErrorMessages.getErrorMessage(error.code);
        dispatch(setMessage({ message: formattedMessage, type: "error" }));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [router, dispatch] // Include dispatch in the dependencies array
  );

  return {
    handleSignUpWithEmail: (email: string, password: string) =>
      handleAction(async () => {
        await signUpWithEmail(email, password, dispatch);
        await sendEmailVerification();
      }, "Registration successful! Please verify your email to continue."),
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
  };
};
