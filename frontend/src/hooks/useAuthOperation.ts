import { useAppDispatch } from "@redux/hooks";
import { setLoading } from "@redux/slices/uiSlice";
import crashlytics from "@react-native-firebase/crashlytics";
import { AlertDialog } from "@components/ui/AlertDialog";
import { useState, useCallback } from "react";

interface AuthResponse {
  success: boolean;
  message?: string;
}

export const useAuthOperation = () => {
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: any, title: string) => {
    const message = error.message || "An error occurred";
    console.error(`${title}:`, error);
    setError(message);
    crashlytics().recordError(error);
    AlertDialog.error(message, title);
    return { success: false, message };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const performAuthOperation = useCallback(
    async (
      operation: () => Promise<AuthResponse>,
      errorTitle: string,
      successMessage?: string
    ) => {
      dispatch(setLoading(true));
      clearError();

      try {
        const result = await operation();

        if (!result.success) {
          const error = new Error(result.message || "Operation failed");
          return handleError(error, errorTitle);
        }

        if (successMessage) {
          AlertDialog.success(successMessage);
        }

        return result;
      } catch (error: any) {
        return handleError(error, errorTitle);
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, handleError, clearError]
  );

  return {
    // State
    error,

    // Actions
    clearError,
    performAuthOperation,
  };
};
