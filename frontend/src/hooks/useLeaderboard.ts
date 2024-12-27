import { useEffect, useState } from "react";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import userStatsService from "@services/data/userStatsService";
import { Leaderboard } from "@src/types/Leaderboard";

export const useLeaderboard = () => {
  const userData = useAppSelector(selectUserData);
  const [leaders, setLeaders] = useState<Leaderboard[]>([]);

  useEffect(() => {
    if (userData?.id) {
      const unsubscribe = userStatsService.fetchLeaderboard((newLeaders) => {
        setLeaders(
          newLeaders.map((leader) => ({
            userId: leader.id,
            name: leader.name,
            points: leader.score,
          }))
        );
      });

      return () => unsubscribe();
    }
  }, [userData]);

  return leaders;
};
