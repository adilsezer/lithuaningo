export interface LeaderboardWeek {
  id: string; // YYYY-WW format
  startDate: string;
  endDate: string;
  entries: Record<string, LeaderboardEntry>;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  rank: number;
  lastUpdated: string;
}
