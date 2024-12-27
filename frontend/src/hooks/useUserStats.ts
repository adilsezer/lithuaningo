import { useState, useEffect } from "react";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import userStatsService from "@services/data/userStatsService";
import { UserProfile } from "@src/types";

export const useUserStats = () => {
  const userData = useAppSelector(selectUserData);
  const [stats, setStats] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (userData?.id) {
      const unsubscribe = userStatsService.fetchStats(userData.id, setStats);
      return () => unsubscribe();
    }
  }, [userData]);

  return {
    todayAnsweredQuestions: stats?.todayAnsweredQuestions ?? 0,
    todayWrongAnsweredQuestions: stats?.todayWrongAnsweredQuestions ?? 0,
    todayCorrectAnsweredQuestions: stats?.todayCorrectAnsweredQuestions ?? 0,
  };
};
