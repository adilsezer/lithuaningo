export interface LeaderboardWeek {
  weekId: string; // YYYY-WW format
  startDate: string;
  endDate: string;
  entries: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  score: number;
  rank: number;
  lastUpdatedTimeAgo: string;
  lastUpdated: string;
}
