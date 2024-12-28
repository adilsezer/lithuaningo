import { useAppDispatch } from "@redux/hooks";
import { setLoading } from "@redux/slices/uiSlice";
import crashlytics from "@react-native-firebase/crashlytics";
import { Alert } from "react-native";

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
        Alert.alert(errorTitle, result.message);
      } else if (successMessage) {
        Alert.alert("Success", successMessage);
      }
      return result;
    } catch (error: any) {
      crashlytics().recordError(error);
      Alert.alert(errorTitle, error.message);
      return { success: false, message: error.message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  return { performAuthOperation };
};
