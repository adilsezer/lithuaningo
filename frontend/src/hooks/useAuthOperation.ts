import {
  useIsLoading,
  useSetLoading,
  useError,
  useSetError,
} from "@stores/useUIStore";
import crashlytics from "@react-native-firebase/crashlytics";
import { useAlertDialog } from "@components/ui/AlertDialog";
import { useCallback } from "react";

interface AuthResponse {
  success: boolean;
  message?: string;
}

export const useAuthOperation = () => {
  const setLoading = useSetLoading();
  const isLoading = useIsLoading();
  const error = useError();
  const setError = useSetError();
  const alertDialog = useAlertDialog();

  const handleError = useCallback(
    (error: any, title: string) => {
      const message = error.message || "An error occurred";
      console.error(`${title}:`, error);
      setError(message);
      crashlytics().recordError(error);
      alertDialog.error(message, title);
      return { success: false, message };
    },
    [setError]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const performAuthOperation = useCallback(
    async (
      operation: () => Promise<AuthResponse>,
      errorTitle: string,
      successMessage?: string
    ) => {
      setLoading(true);
      clearError();

      try {
        const result = await operation();

        if (!result.success) {
          const error = new Error(result.message || "Operation failed");
          return handleError(error, errorTitle);
        }

        if (successMessage) {
          alertDialog.success(successMessage);
        }

        return result;
      } catch (error: any) {
        return handleError(error, errorTitle);
      } finally {
        setLoading(false);
      }
    },
    [handleError, clearError, setLoading]
  );

  return {
    // State
    error,
    isLoading,

    // Actions
    clearError,
    performAuthOperation,
  };
};
