import { useEffect, useState } from "react";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { LeaderboardWeek } from "@src/types";
import leaderboardService from "@services/data/leaderboardService";
import { startOfWeek, addDays } from "date-fns";

const getWeekDates = (
  weekId: string
): { startDate: Date; endDate: Date } | null => {
  try {
    const [year, week] = weekId.split("-").map(Number);
    if (!year || !week) return null;

    // Get January 1st of the year
    const jan1 = new Date(year, 0, 1);
    // Get the first Thursday of the year (determines week 1)
    const firstThursday = startOfWeek(jan1, { weekStartsOn: 1 });
    firstThursday.setDate(firstThursday.getDate() + 3);

    // Calculate the start of the desired week
    const weekStart = new Date(firstThursday);
    weekStart.setDate(firstThursday.getDate() + (week - 1) * 7);
    const weekStartMonday = startOfWeek(weekStart, { weekStartsOn: 1 });

    // Calculate the end of the week (Sunday)
    const weekEnd = addDays(weekStartMonday, 6);
    weekEnd.setHours(23, 59, 59, 999);

    return {
      startDate: weekStartMonday,
      endDate: weekEnd,
    };
  } catch {
    return null;
  }
};

const convertToValidDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  if (Object.keys(timestamp).length === 0) return null;

  // Handle Firestore Timestamp format
  if (timestamp._seconds !== undefined) {
    return new Date(timestamp._seconds * 1000);
  }

  // Handle ISO string format
  try {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

export const useLeaderboard = () => {
  const userData = useAppSelector(selectUserData);
  const [leaderboard, setLeaderboard] = useState<LeaderboardWeek | null>(null);

  useEffect(() => {
    if (userData?.id) {
      leaderboardService.getCurrentWeekLeaderboard().then((newLeaderboard) => {
        setLeaderboard(newLeaderboard);
      });

      return () => {};
    }
  }, [userData]);

  const updateScore = async (score: number) => {
    if (!userData?.id || !userData?.name) return false;

    const success = await leaderboardService.updateLeaderboardEntry(
      userData.id,
      userData.name,
      score
    );

    if (success) {
      const updatedLeaderboard =
        await leaderboardService.getCurrentWeekLeaderboard();
      if (updatedLeaderboard) {
        setLeaderboard(updatedLeaderboard);
      }
    }

    return success;
  };

  const sortedEntries = leaderboard
    ? Object.entries(leaderboard.entries)
        .map(([userId, entry]) => ({
          userId,
          ...entry,
        }))
        .sort((a, b) => b.score - a.score)
    : [];

  let dates = leaderboard?.id ? getWeekDates(leaderboard.id) : null;

  return {
    entries: sortedEntries,
    updateScore,
    weekId: leaderboard?.id,
    startDate: dates?.startDate ?? null,
    endDate: dates?.endDate ?? null,
  };
};
