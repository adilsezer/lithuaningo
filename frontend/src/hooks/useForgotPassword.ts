import { useCallback, useEffect } from "react";
import { useAuth } from "@hooks/useAuth";
import { useAppSelector } from "@redux/hooks";
import { selectIsLoading } from "@redux/slices/uiSlice";
import crashlytics from "@react-native-firebase/crashlytics";

export type ForgotPasswordData = {
  email: string;
};

export const useForgotPassword = () => {
  const isLoading = useAppSelector(selectIsLoading);
  const { resetPassword, error, clearError } = useAuth();

  // Log screen load for analytics
  useEffect(() => {
    crashlytics().log("Forgot password screen loaded.");
  }, []);

  const handleResetPassword = useCallback(
    async (data: ForgotPasswordData) => {
      try {
        await resetPassword(data.email);
        return true;
      } catch (error) {
        console.error("Failed to reset password:", error);
        return false;
      }
    },
    [resetPassword]
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
