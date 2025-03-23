import { useState, useCallback } from "react";
import {
  UserChallengeStats,
  UpdateUserChallengeStatsRequest,
  CreateUserChallengeStatsRequest,
} from "@src/types";
import { UserChallengeStatsService } from "@src/services/data/userChallengeStatsService";
import useUIStore from "@stores/useUIStore";

// Define the return type of the hook
interface UseUserChallengeStatsReturn {
  stats: UserChallengeStats | null;
  isLoading: boolean;
  error: string | null;
  updateStats: (
    updateData: Partial<Omit<UserChallengeStats, "id" | "userId">>,
    statsOverride?: UserChallengeStats | null
  ) => Promise<void>;
  createStats: () => Promise<UserChallengeStats | null>;
  fetchStats: () => Promise<void>;
  fetchStatsDirectly: () => Promise<UserChallengeStats | null>;
  checkStatsExistence: () => Promise<boolean>;
  hasCheckedExistence: boolean;
}

export const useUserChallengeStats = (
  userId?: string
): UseUserChallengeStatsReturn => {
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
      setHasCheckedExistence(true);
    } catch (error) {
      console.error(
        `[useUserChallengeStats] Error fetching stats for userId: ${userId}:`,
        error
      );
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
    if (!userId) {
      return null;
    }

    // Check if stats already exist before trying to create
    if (!hasCheckedExistence) {
      const exists = await checkStatsExistence();

      if (exists) {
        const existingStats = await fetchStatsDirectly(); // Use a direct fetch function that returns stats
        return existingStats; // Return the stats instead of waiting for state update
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
      return createdStats; // Return the stats
    } catch (error) {
      console.error(
        `[useUserChallengeStats] createStats: Error creating stats:`,
        error
      );

      // If creation fails due to stats already existing, try to fetch them
      if (error instanceof Error && error.message.includes("409")) {
        const existingStats = await fetchStatsDirectly(); // Use a direct fetch function that returns stats
        return existingStats; // Return the stats
      } else {
        setError(
          error instanceof Error ? error.message : "Failed to create stats"
        );
        return null; // Return null to indicate failure
      }
    } finally {
      setLoading(false);
    }
  }, [userId, setLoading, hasCheckedExistence, checkStatsExistence]);

  // Add a direct fetch function that returns stats
  const fetchStatsDirectly =
    useCallback(async (): Promise<UserChallengeStats | null> => {
      if (!userId) {
        return null;
      }

      try {
        const data = await UserChallengeStatsService.getUserChallengeStats(
          userId
        );

        setStats(data); // Update state
        setError(null);
        setHasCheckedExistence(true);
        return data; // Return the stats directly
      } catch (error) {
        console.error(
          `[useUserChallengeStats] fetchStatsDirectly: Error fetching stats:`,
          error
        );
        setError(
          error instanceof Error ? error.message : "Failed to fetch stats"
        );
        return null;
      }
    }, [userId]);

  // Update existing stats for a user - modify to accept stats parameter
  const updateStats = useCallback(
    async (
      updateData: Partial<Omit<UserChallengeStats, "id" | "userId">>,
      statsOverride?: UserChallengeStats | null
    ) => {
      if (!userId) {
        return;
      }

      // Use statsOverride if provided, otherwise use component state
      const statsToUpdate = statsOverride || stats;

      if (!statsToUpdate) {
        return;
      }

      setLoading(true);
      try {
        // Prepare the update request
        const updateRequest: UpdateUserChallengeStatsRequest = {
          currentStreak:
            updateData.currentStreak ?? statsToUpdate.currentStreak,
          longestStreak:
            updateData.longestStreak ?? statsToUpdate.longestStreak,
          todayCorrectAnswers:
            updateData.todayCorrectAnswers ?? statsToUpdate.todayCorrectAnswers,
          todayIncorrectAnswers:
            updateData.todayIncorrectAnswers ??
            statsToUpdate.todayIncorrectAnswers,
          totalChallengesCompleted:
            updateData.totalChallengesCompleted ??
            statsToUpdate.totalChallengesCompleted,
          totalCorrectAnswers:
            updateData.totalCorrectAnswers ?? statsToUpdate.totalCorrectAnswers,
          totalIncorrectAnswers:
            updateData.totalIncorrectAnswers ??
            statsToUpdate.totalIncorrectAnswers,
        };

        // Send update request to API
        await UserChallengeStatsService.updateUserChallengeStats(
          userId,
          updateRequest
        );

        // Update local state with the new values
        setStats({
          ...statsToUpdate,
          ...updateRequest,
        });

        setError(null);
      } catch (error) {
        console.error(
          `[useUserChallengeStats] updateStats: Error updating stats:`,
          error
        );
        setError(
          error instanceof Error ? error.message : "Failed to update stats"
        );
      } finally {
        setLoading(false);
      }
    },
    [userId, stats, setLoading]
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
    fetchStatsDirectly,
  };
};
