import apiClient from "@services/api/apiClient";
import { LeaderboardEntry } from "@src/types";

const getLeaderboardEntries = async (): Promise<LeaderboardEntry[]> => {
  try {
    return await apiClient.getLeaderboardEntries();
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};

const updateLeaderboardEntry = async (
  entry: LeaderboardEntry
): Promise<LeaderboardEntry | undefined> => {
  try {
    return (await apiClient.updateLeaderboardEntry(entry)) as LeaderboardEntry;
  } catch (error) {
    console.error("Error updating leaderboard entry:", error);
    return undefined;
  }
};

export default {
  getLeaderboardEntries,
  updateLeaderboardEntry,
};
