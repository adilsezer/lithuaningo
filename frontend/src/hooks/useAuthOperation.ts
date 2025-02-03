import {
  useIsLoading,
  useSetLoading,
  useError,
  useSetError,
} from "@stores/useUIStore";
import { useAlertDialog } from "@hooks/useAlertDialog";
import { useCallback } from "react";

interface AuthResponse {
  success: boolean;
  message?: string;
}

export const useAuthOperation = () => {
  const setLoading = useSetLoading();
  const setError = useSetError();
  const { showError, showSuccess } = useAlertDialog();

  const handleError = useCallback(
    (error: any, title: string) => {
      const message = error.message || "An error occurred";
      console.error(`${title}:`, error);
      setError(message);
      //crashlytics().recordError(error);
      showError(message, title);
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
          showSuccess(successMessage);
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
    performAuthOperation,
  };
};
