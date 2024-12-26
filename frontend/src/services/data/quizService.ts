import apiClient from "@services/api/apiClient";
import { QuizQuestion } from "@src/types";

export const generateQuiz = async (userId: string): Promise<QuizQuestion[]> => {
  try {
    return await apiClient.generateQuiz(userId);
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    return [];
  }
};
