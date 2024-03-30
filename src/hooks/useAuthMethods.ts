import { useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { AuthErrorMessages } from "../features/auth/utilities/AuthErrorMessages";
import { router } from "expo-router";
import {
  sendPasswordResetEmail,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from "@features/auth/services/FirebaseAuthService";
import { signInWithGoogle } from "@features/auth/services/GoogleAuthService";

export const useAuthMethods = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const dispatch = useAppDispatch();

  const handleSignUpWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(""); // Clear any existing errors
    try {
      await signUpWithEmail(email, password, dispatch);
      router.replace("/dashboard"); // Adjust as needed for your routing logic
    } catch (error: any) {
      console.error("Error signing up with email: ", error.code, error.message);
      const errorMessage = AuthErrorMessages.getErrorMessage(error.code);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(""); // Clear any existing errors
    try {
      await signInWithEmail(email, password, dispatch);
      router.replace("/dashboard");
    } catch (error: any) {
      console.error("Error signing in with email: ", error.code, error.message);
      const errorMessage = AuthErrorMessages.getErrorMessage(error.code);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithGoogle = async () => {
    setLoading(true);
    setError(""); // Clear any existing errors
    try {
      await signInWithGoogle(dispatch);
      router.replace("/dashboard");
    } catch (error: any) {
      console.error("Error signing in with Google: ", error.message);
      const errorMessage =
        error?.message || "An unexpected error occurred. Please try again.";
      setError(`Failed to log in with Google: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError(""); // Clear any existing errors
    try {
      await signOutUser(dispatch);
      router.replace("/");
    } catch (error: any) {
      console.error("Error signing out: ", error.message);
      setError("An error occurred while trying to sign out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (email: string) => {
    setLoading(true);
    setError(""); // Clear any existing errors
    setSuccessMessage(""); // Clear any existing success messages
    try {
      await sendPasswordResetEmail(email);
      setSuccessMessage("Please check your email to reset your password.");
    } catch (error: any) {
      console.error(
        "Error sending password reset email: ",
        error.code,
        error.message
      );
      const errorMessage =
        AuthErrorMessages.getErrorMessage(error.code) ||
        "Failed to send password reset email. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleSignUpWithEmail,
    handleLoginWithEmail,
    handleLoginWithGoogle,
    handleSignOut,
    handlePasswordReset,
    loading,
    error,
    successMessage, // Expose the successMessage state for use in components
  };
};
