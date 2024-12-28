import apiClient from "@services/api/apiClient";
import { UserProfile } from "@src/types";

const fetchStats = (
  userId: string,
  onStatsChange: (stats: UserProfile | null) => void
) => {
  const interval = setInterval(async () => {
    try {
      const response = await apiClient.getUserProfile(userId);
      onStatsChange(response);
    } catch (error) {
      console.error("Error fetching stats:", error);
      onStatsChange(null);
    }
  }, 5000);

  return () => clearInterval(interval);
};

const updateUserStats = async (
  userId: string,
  isCorrect: boolean
): Promise<void> => {
  try {
    var userProfile = await apiClient.getUserProfile(userId);
    if (userProfile) {
      userProfile.todayAnsweredQuestions += isCorrect ? 1 : 0;
      userProfile.todayCorrectAnsweredQuestions += isCorrect ? 1 : 0;
      userProfile.todayWrongAnsweredQuestions += isCorrect ? 0 : 1;
      await apiClient.updateUserProfile(userProfile);
    }
  } catch (error) {
    console.error("Error updating stats:", error);
    throw new Error("Failed to update user stats.");
  }
};

export default {
  fetchStats,
  updateUserStats,
};
