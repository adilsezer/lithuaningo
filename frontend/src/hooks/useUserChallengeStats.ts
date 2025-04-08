import { useState, useCallback } from "react";
import { UserChallengeStatsResponse } from "@src/types";
import { UserChallengeStatsService } from "@src/services/data/userChallengeStatsService";
import useUIStore from "@stores/useUIStore";

// Define the return type of the hook
interface UseUserChallengeStatsReturn {
  stats: UserChallengeStatsResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

export const useUserChallengeStats = (
  userId?: string
): UseUserChallengeStatsReturn => {
  const [stats, setStats] = useState<UserChallengeStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setLoading } = useUIStore();
  const isLoading = useUIStore((state) => state.isLoading);

  // Fetch stats - will create them if they don't exist
  const fetchStats = useCallback(async () => {
    if (!userId) {
      return;
    }

    setLoading(true);

    try {
      const data = await UserChallengeStatsService.getUserChallengeStats(
        userId
      );
      setStats(data);
      setError(null);
    } catch (error) {
      console.error(
        `[useUserChallengeStats] Error fetching stats for userId: ${userId}:`,
        error
      );
      setError(
        error instanceof Error ? error.message : "Failed to fetch stats"
      );
    } finally {
      setLoading(false);
    }
  }, [userId, setLoading]);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
  };
};
