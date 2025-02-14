export interface LeaderboardWeek {
  id: string;
  startDate: string;
  endDate: string;
  entries: { [key: string]: LeaderboardEntry };
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  score: number;
}

export interface UpdateLeaderboardEntryRequest {
  userId: string;
  score: number;
}

export type LeaderboardTimeRange = "week" | "month" | "all";
