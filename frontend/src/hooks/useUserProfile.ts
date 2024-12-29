import { useState, useEffect } from "react";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { UserProfile } from "@src/types";
import userProfileService from "@services/data/userProfileService";

export const useUserProfile = () => {
  const { id: userId } = useAppSelector(selectUserData) ?? {};
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      const profile = await userProfileService.fetchUserProfile(userId);
      setProfile(profile);
    };

    fetchProfile();
  }, [userId]);

  const updateAnswerStats = async (isCorrect: boolean) => {
    if (!userId || __DEV__) return;

    try {
      await userProfileService.updateUserStats(userId, isCorrect);
    } catch (error) {
      console.error("Error updating user stats:", error);
    }
  };

  return {
    profile,
    updateAnswerStats,
  };
};
