import { useCallback, useEffect } from "react";
import { useAuth } from "@hooks/useAuth";
import {
  useIsLoading,
  useSetLoading,
  useError,
  useSetError,
} from "@stores/useUIStore";
import crashlytics from "@react-native-firebase/crashlytics";

export type ForgotPasswordData = {
  email: string;
};

export const useForgotPassword = () => {
  const isLoading = useIsLoading();
  const setLoading = useSetLoading();
  const setError = useSetError();
  const error = useError();
  const { resetPassword } = useAuth();

  // Log screen load for analytics
  useEffect(() => {
    crashlytics().log("Forgot password screen loaded.");
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const handleResetPassword = useCallback(
    async (data: ForgotPasswordData) => {
      try {
        setLoading(true);
        setError(null);
        await resetPassword(data.email);
        return true;
      } catch (error) {
        setError("Failed to reset password");
        console.error("Error resetting password:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [resetPassword, setLoading, setError]
  );

  return {
    // State
    isLoading,
    error,

    // Actions
    handleResetPassword,
    clearError,
  } as const;
};
