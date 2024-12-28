import { useAppDispatch } from "@redux/hooks";
import { setLoading } from "@redux/slices/uiSlice";
import crashlytics from "@react-native-firebase/crashlytics";
import { AlertDialog } from "@components/ui/AlertDialog";

interface AuthResponse {
  success: boolean;
  message?: string;
}

export const useAuthOperation = () => {
  const dispatch = useAppDispatch();

  const performAuthOperation = async (
    operation: () => Promise<AuthResponse>,
    errorTitle: string,
    successMessage?: string
  ) => {
    dispatch(setLoading(true));
    try {
      const result = await operation();
      if (!result.success) {
        crashlytics().recordError(
          new Error(`${errorTitle}: ${result.message}`)
        );
        AlertDialog.error(result.message || "An error occurred", errorTitle);
      } else if (successMessage) {
        AlertDialog.success(successMessage);
      }
      return result;
    } catch (error: any) {
      crashlytics().recordError(error);
      AlertDialog.error(error.message, errorTitle);
      return { success: false, message: error.message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  return { performAuthOperation };
};
