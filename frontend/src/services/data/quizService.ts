import apiClient, { ApiError } from "@services/api/apiClient";
import { QuizQuestion } from "@src/types";
import crashlytics from "@react-native-firebase/crashlytics";

export const generateQuiz = async (userId: string): Promise<QuizQuestion[]> => {
  try {
    return await apiClient.generateQuiz(userId);
  } catch (error) {
    if (error instanceof ApiError) {
      crashlytics().recordError(error);
      console.error(`API Error ${error.status}:`, error.data);
    } else {
      console.error("Error fetching quiz questions:", error);
    }
    return [];
  }
};
