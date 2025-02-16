export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  score: number;
  weekId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateLeaderboardEntryRequest {
  userId: string;
  score: number;
}

export type LeaderboardTimeRange = "week" | "month" | "all";
