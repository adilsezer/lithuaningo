import apiClient from "@services/api/apiClient";
import { UserProfile } from "@src/types";

const fetchUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  try {
    return await apiClient.getUserProfile(userId);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

const getMostRecentTwoLearnedSentences = async (
  userId: string
): Promise<string[]> => {
  try {
    const sentences = await apiClient.getLastNLearnedSentences(userId, 2);
    return sentences.map((s) => s.text);
  } catch (error) {
    console.error("Error getting recent learned sentences:", error);
    return [];
  }
};

export default {
  fetchUserProfile,
  getMostRecentTwoLearnedSentences,
};
