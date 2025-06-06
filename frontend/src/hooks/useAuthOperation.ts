import { useSetLoading, useSetError } from "@stores/useUIStore";
import { useAlertDialog } from "@hooks/useAlertDialog";
import { useCallback } from "react";
import { AuthResponse } from "@src/types/auth.types";

export const useAuthOperation = () => {
  const setLoading = useSetLoading();
  const setError = useSetError();
  const { showError, showSuccess } = useAlertDialog();

  const handleError = useCallback(
    (error: unknown, title: string) => {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      console.error(`${title}:`, error);
      setError(message);
      //crashlytics().recordError(error);
      showError(message, title);
      return { success: false, message };
    },
    [setError, showError],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const performAuthOperation = useCallback(
    async (
      operation: () => Promise<AuthResponse>,
      errorTitle: string,
      options?: { showSuccessAlert?: boolean },
    ) => {
      setLoading(true);
      clearError();

      try {
        const result = await operation();

        if (!result.success) {
          const error = new Error(result.message || "Operation failed");
          return handleError(error, errorTitle);
        }

        // Show success alert if requested and there's a message
        if (options?.showSuccessAlert && result.message) {
          showSuccess(result.message, "Success");
        }

        return result;
      } catch (error: unknown) {
        return handleError(error, errorTitle);
      } finally {
        setLoading(false);
      }
    },
    [handleError, clearError, setLoading, showSuccess],
  );

  return {
    performAuthOperation,
  };
};
