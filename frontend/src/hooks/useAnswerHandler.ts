import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import userStatsService from "@services/data/userStatsService";

export const useAnswerHandler = () => {
  const userData = useAppSelector(selectUserData);

  const handleAnswer = async (isCorrect: boolean) => {
    if (!userData?.id || __DEV__) return;

    try {
      await userStatsService.updateUserStats(userData.id, isCorrect);
    } catch (error) {
      console.error("Error updating user stats:", error);
    }
  };

  return handleAnswer;
};
