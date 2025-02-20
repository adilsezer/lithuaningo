import { useCallback, useEffect } from "react";
import { useAuth } from "@hooks/useAuth";
import {
  useIsLoading,
  useSetLoading,
  useError,
  useSetError,
} from "@stores/useUIStore";

export const useForgotPassword = () => {
  const isLoading = useIsLoading();
  const setLoading = useSetLoading();
  const setError = useSetError();
  const error = useError();
  const { resetPassword } = useAuth();

  // Log screen load for analytics
  useEffect(() => {
    // crashlytics().log("Forgot password screen loaded.");
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const handleResetPassword = useCallback(
    async (email: string) => {
      try {
        setLoading(true);
        setError(null);
        const result = await resetPassword(email);

        if (!result.success) {
          setError(result.message || "Failed to reset password");
          return result;
        }
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to reset password";
        setError(errorMessage);
        return { success: false, message: errorMessage };
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
