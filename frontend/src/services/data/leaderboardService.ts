import apiClient from "@services/api/apiClient";
import { Leaderboard } from "@src/types";

const fetchLeaderboard = async (): Promise<Leaderboard[]> => {
  try {
    return await apiClient.getLeaderboard();
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};
