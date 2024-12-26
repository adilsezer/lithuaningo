import { useAppDispatch } from "@redux/hooks";
import { setLoading } from "@redux/slices/uiSlice";
import { Alert } from "react-native";
import crashlytics from "@react-native-firebase/crashlytics";

export const useAuthOperation = () => {
  const dispatch = useAppDispatch();

  const performAuthOperation = async (
    operation: () => Promise<{ success: boolean; message?: string }>,
    errorTitle: string,
    successMessage?: string
  ) => {
    dispatch(setLoading(true));
    try {
      const result = await operation();
      if (!result.success) {
        crashlytics().recordError(new Error(`${errorTitle} failed`));
        Alert.alert(errorTitle, result.message || "An error occurred.");
      } else if (successMessage) {
        Alert.alert("Success", successMessage);
      }
      return result;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return { performAuthOperation };
};
