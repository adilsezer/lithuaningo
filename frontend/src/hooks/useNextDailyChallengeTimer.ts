import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@services/api/apiClient";

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

interface UseNextDailyChallengeTimerOptions {
  useServerTime?: boolean;
}

export const useNextDailyChallengeTimer = (
  options: UseNextDailyChallengeTimerOptions = {}
) => {
  const { useServerTime = false } = options;
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
  });
  const [isNextDay, setIsNextDay] = useState(false);
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0);

  // Fetch server time offset if useServerTime is enabled
  const fetchServerTime = useCallback(async () => {
    if (!useServerTime) return;

    try {
      const response = await apiClient.getNextChallengeTime();
      const serverTime = new Date(response.currentTimeUtc).getTime();
      const clientTime = new Date().getTime();
      setServerTimeOffset(serverTime - clientTime);
    } catch (error) {
      console.warn("Failed to fetch server time, using client time:", error);
      setServerTimeOffset(0);
    }
  }, [useServerTime]);

  const calculateTimeUntilNextChallenge = useCallback((): TimeRemaining => {
    const now = new Date();
    const adjustedNow = new Date(now.getTime() + serverTimeOffset);
    const tomorrow = new Date(adjustedNow);

    // Set tomorrow to 00:00:00 UTC
    tomorrow.setUTCDate(adjustedNow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);

    const timeDiff = tomorrow.getTime() - adjustedNow.getTime();

    if (timeDiff <= 0) {
      // If we've passed midnight UTC, the next challenge is available
      setIsNextDay(true);
      return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
    }

    const totalSeconds = Math.floor(timeDiff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds, totalSeconds };
  }, [serverTimeOffset]);

  useEffect(() => {
    // Fetch server time if needed
    fetchServerTime();
  }, [fetchServerTime]);

  useEffect(() => {
    // Calculate initial time
    setTimeRemaining(calculateTimeUntilNextChallenge());

    // Update every second
    const interval = setInterval(() => {
      const newTime = calculateTimeUntilNextChallenge();
      setTimeRemaining(newTime);

      // Check if we've reached the next day
      if (newTime.totalSeconds === 0 && !isNextDay) {
        setIsNextDay(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeUntilNextChallenge, isNextDay]);

  const formatTime = useCallback((time: TimeRemaining): string => {
    const { hours, minutes, seconds } = time;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }, []);

  return {
    timeRemaining,
    isNextDay,
    formatTime,
    formattedTime: formatTime(timeRemaining),
  };
};
