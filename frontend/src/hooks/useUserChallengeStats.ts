import { useState, useCallback } from "react";
import {
  UserChallengeStats,
  UpdateUserChallengeStatsRequest,
  CreateUserChallengeStatsRequest,
} from "@src/types";
import { UserChallengeStatsService } from "@src/services/data/userChallengeStatsService";
import useUIStore from "@stores/useUIStore";

export const useUserChallengeStats = (userId?: string) => {
  const [stats, setStats] = useState<UserChallengeStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setLoading } = useUIStore();
  const isLoading = useUIStore((state) => state.isLoading);
  const [hasCheckedExistence, setHasCheckedExistence] = useState(false);

  // Check if stats exist for the user without updating state
  const checkStatsExistence = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    try {
      await UserChallengeStatsService.getUserChallengeStats(userId);
      return true;
    } catch (error) {
      // If we get a 404, stats don't exist
      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }
      // For other errors, we're not sure, so we'll assume stats might exist
      return false;
    }
  }, [userId]);

  // Fetch stats only once when the hook is initialized
  const fetchStats = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const data = await UserChallengeStatsService.getUserChallengeStats(
        userId
      );
      setStats(data);
      setError(null);
      setHasCheckedExistence(true);
    } catch (error) {
      console.error("Error fetching user challenge stats:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch stats"
      );
      setHasCheckedExistence(true);
    } finally {
      setLoading(false);
    }
  }, [userId, setLoading]);

  // Create new stats for a user
  const createStats = useCallback(async () => {
    if (!userId) return;

    // Check if stats already exist before trying to create
    if (!hasCheckedExistence) {
      const exists = await checkStatsExistence();
      if (exists) {
        await fetchStats(); // If stats exist, just fetch them
        return;
      }
    }

    // Only proceed with creation if we know stats don't exist
    setLoading(true);
    try {
      const newStatsRequest: CreateUserChallengeStatsRequest = {
        userId,
        currentStreak: 0,
        longestStreak: 0,
        todayCorrectAnswers: 0,
        todayIncorrectAnswers: 0,
        totalChallengesCompleted: 0,
        totalCorrectAnswers: 0,
        totalIncorrectAnswers: 0,
      };

      const createdStats =
        await UserChallengeStatsService.createUserChallengeStats(
          newStatsRequest
        );
      setStats(createdStats);
      setError(null);
    } catch (error) {
      console.error("Error creating user challenge stats:", error);

      // If creation fails due to stats already existing, try to fetch them
      if (error instanceof Error && error.message.includes("409")) {
        console.log(
          "Stats creation failed - stats likely exist. Fetching existing stats..."
        );
        await fetchStats();
      } else {
        setError(
          error instanceof Error ? error.message : "Failed to create stats"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [
    userId,
    setLoading,
    fetchStats,
    hasCheckedExistence,
    checkStatsExistence,
  ]);

  // Update stats with optimistic updates
  const updateStats = useCallback(
    async (updates: Partial<UpdateUserChallengeStatsRequest>) => {
      if (!userId || !stats) return;

      // Calculate proper longestStreak based on currentStreak update
      const newCurrentStreak =
        updates.currentStreak !== undefined
          ? updates.currentStreak
          : stats.currentStreak;

      // If currentStreak is being updated, make sure longestStreak is updated as well if needed
      if (
        updates.currentStreak !== undefined &&
        (updates.longestStreak === undefined ||
          updates.longestStreak < updates.currentStreak)
      ) {
        // Ensure longestStreak is at least as large as currentStreak
        updates.longestStreak = Math.max(
          updates.currentStreak,
          stats.longestStreak
        );
      }

      // Optimistic update with corrected values
      const updatedStats = {
        ...stats,
        ...updates,
      };
      setStats(updatedStats);

      try {
        // Create complete request object by merging with existing stats
        const completeUpdates: UpdateUserChallengeStatsRequest = {
          currentStreak: stats.currentStreak,
          longestStreak: stats.longestStreak,
          todayCorrectAnswers: stats.todayCorrectAnswers,
          todayIncorrectAnswers: stats.todayIncorrectAnswers,
          totalChallengesCompleted: stats.totalChallengesCompleted,
          totalCorrectAnswers: stats.totalCorrectAnswers,
          totalIncorrectAnswers: stats.totalIncorrectAnswers,
          ...updates,
        };

        // Final check to ensure validation will pass
        if (completeUpdates.longestStreak < completeUpdates.currentStreak) {
          completeUpdates.longestStreak = completeUpdates.currentStreak;
        }

        await UserChallengeStatsService.updateUserChallengeStats(
          userId,
          completeUpdates
        );
        // No need to update state with returned data since the backend returns void
      } catch (error) {
        // Revert on error
        setStats(stats);
        console.error("Error updating challenge stats:", error);
        throw error;
      }
    },
    [userId, stats]
  );

  return {
    stats,
    isLoading,
    error,
    fetchStats,
    updateStats,
    createStats,
    checkStatsExistence,
    hasCheckedExistence,
  };
};
