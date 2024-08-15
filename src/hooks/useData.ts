import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { selectUserData } from "../redux/slices/userSlice";
import userStatsService, { Stats } from "../services/data/userStatsService";

interface Leader {
  id: string;
  name: string;
  score: number;
}

interface UseDataReturn {
  stats: Stats | null;
  leaders: Leader[];
  handleAnswer: (isCorrect: boolean, timeSpent: number) => Promise<void>;
}

const useData = (): UseDataReturn => {
  const userData = useAppSelector(selectUserData);
  const dispatch = useAppDispatch();
  const [stats, setStats] = useState<Stats | null>(null);
  const [leaders, setLeaders] = useState<Leader[]>([]);

  useEffect(() => {
    if (userData && userData.id) {
      const unsubscribeStats = userStatsService.fetchStats(
        userData.id,
        (newStats) => {
          setStats(newStats);
        }
      );

      const unsubscribeLeaders = userStatsService.fetchLeaderboard(
        (newLeaders) => {
          setLeaders(newLeaders);
        }
      );

      return () => {
        unsubscribeStats();
        unsubscribeLeaders();
      };
    }
  }, [userData, dispatch]);

  const handleAnswer = async (isCorrect: boolean, timeSpent: number) => {
    if (!userData || !userData.id || __DEV__) return;

    try {
      await userStatsService.updateUserStats(userData.id, isCorrect, timeSpent);
    } catch (error) {
      console.error("Error updating user stats:", error);
    }
  };

  return { stats, leaders, handleAnswer };
};

export default useData;
