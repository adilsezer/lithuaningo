import { useState, useCallback, useEffect } from "react";
import { useUserData } from "@stores/useUserStore";
import { useIsLoading, useSetLoading, useSetError } from "@stores/useUIStore";
import { UserProfile } from "@src/types";
import userProfileService from "@services/data/userProfileService";

export const useUserProfile = () => {
  const userData = useUserData();
  const userId = userData?.id;
  const setLoading = useSetLoading();
  const isLoading = useIsLoading();
  const setError = useSetError();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const userProfile = await userProfileService.fetchUserProfile(userId);
      setProfile(userProfile);
    } catch (err) {
      setError("Failed to fetch user profile");
      console.error("Error fetching user profile:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, setLoading, setError]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    fetchProfile,
  };
};
