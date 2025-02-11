import { useEffect, useState } from "react";
import { useUserData } from "@stores/useUserStore";
import { LeaderboardWeek } from "@src/types";
import leaderboardService from "@services/data/leaderboardService";

export const useLeaderboard = () => {
  const userData = useUserData();
  const [leaderboard, setLeaderboard] = useState<LeaderboardWeek | null>(null);

  useEffect(() => {
    if (userData?.id) {
      leaderboardService.getCurrentWeekLeaderboard().then((newLeaderboard) => {
        setLeaderboard(newLeaderboard);
      });
    }
  }, [userData]);

  const updateScore = async (score: number) => {
    if (!userData?.id || !userData?.fullName) return false;

    const success = await leaderboardService.updateLeaderboardEntry(
      userData.id,
      userData.fullName,
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

  return {
    entries: leaderboard?.entries ?? [],
    updateScore,
    weekId: leaderboard?.weekId,
    startDate: leaderboard?.startDate ?? undefined,
    endDate: leaderboard?.endDate ?? undefined,
  };
};
