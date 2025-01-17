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

  return {
    profile,
  };
};
