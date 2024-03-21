import { useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { AuthErrorMessages } from "../features/auth/utilities/AuthErrorMessages";
import { router } from "expo-router";
import { signInWithEmail } from "@features/auth/services/FirebaseAuthService";
import { signInWithGoogle } from "@features/auth/services/GoogleAuthService";

export const useSignInMethods = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const dispatch = useAppDispatch();

  const handleLoginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(""); // Clear any existing errors
    try {
      await signInWithEmail(email, password, dispatch);
      router.replace("/");
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
      router.replace("/");
    } catch (error: any) {
      console.error("Error signing in with Google: ", error.message);
      const errorMessage =
        error?.message || "An unexpected error occurred. Please try again.";
      setError(`Failed to log in with Google: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleLoginWithEmail,
    handleLoginWithGoogle,
    loading,
    error,
  };
};
