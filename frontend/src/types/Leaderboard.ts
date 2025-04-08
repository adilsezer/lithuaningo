export interface UpdateLeaderboardEntryRequest {
  userId: string;
  scoreToAdd: number;
}

export interface LeaderboardEntryResponse {
  id: string;
  userId: string;
  rank: number;
  username: string;
  score: number;
}
