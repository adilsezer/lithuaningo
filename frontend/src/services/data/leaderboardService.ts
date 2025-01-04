import apiClient, { ApiError } from "@services/api/apiClient";
import { LeaderboardEntry } from "@src/types";
import crashlytics from "@react-native-firebase/crashlytics";

const getLeaderboardEntries = async (): Promise<LeaderboardEntry[]> => {
  try {
    return await apiClient.getLeaderboardEntries();
  } catch (error) {
    if (error instanceof ApiError) {
      crashlytics().recordError(error);
      console.error(`API Error ${error.status}:`, error.data);
    } else {
      console.error("Error fetching leaderboard:", error);
    }
    return [];
  }
};

const updateLeaderboardEntry = async (
  entry: LeaderboardEntry
): Promise<LeaderboardEntry | undefined> => {
  try {
    return (await apiClient.updateLeaderboardEntry(entry)) as LeaderboardEntry;
  } catch (error) {
    if (error instanceof ApiError) {
      crashlytics().recordError(error);
      console.error(`API Error ${error.status}:`, error.data);
    } else {
      console.error("Error updating leaderboard entry:", error);
    }
    return undefined;
  }
};

export default {
  getLeaderboardEntries,
  updateLeaderboardEntry,
};
