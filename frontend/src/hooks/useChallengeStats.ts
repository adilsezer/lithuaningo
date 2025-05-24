import { useState, useCallback } from 'react';
import {
  UserChallengeStatsResponse,
  SubmitChallengeAnswerRequest,
} from '@src/types';
import { UserChallengeStatsService } from '@services/data/userChallengeStatsService';

export const useChallengeStats = (userId?: string) => {
  const [stats, setStats] = useState<UserChallengeStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserChallengeStats = useCallback(async () => {
    if (!userId) {
      setError('User ID is required');
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await UserChallengeStatsService.getUserChallengeStats(
        userId,
      );
      setStats(data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch user challenge stats';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const submitChallengeAnswer = useCallback(
    async (request: SubmitChallengeAnswerRequest) => {
      if (!userId) {
        setError('User ID is required');
        return null;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await UserChallengeStatsService.submitChallengeAnswer({
          ...request,
          userId,
        });
        setStats(data);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to submit challenge answer';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId],
  );

  return {
    stats,
    isLoading,
    error,
    getUserChallengeStats,
    submitChallengeAnswer,
  };
};
