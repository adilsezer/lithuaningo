export interface LeaderboardWeek {
  id: string; // YYYY-WW format
  startDate: Date;
  endDate: Date;
  entries: Record<string, LeaderboardEntry>;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  rank: number;
  lastUpdated: Date;
}
