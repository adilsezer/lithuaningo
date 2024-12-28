import { useEffect, useState } from "react";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import userStatsService from "@services/data/userStatsService";
import { Leader } from "@src/types/Leader";

export const useLeaderboard = () => {
  const userData = useAppSelector(selectUserData);
  const [leaders, setLeaders] = useState<Leader[]>([]);

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
