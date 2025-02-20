import { useState, useCallback, useEffect } from "react";
import { useUserData } from "@stores/useUserStore";
import { useIsLoading, useSetLoading, useSetError } from "@stores/useUIStore";
import { UserProfile, UpdateUserProfileRequest } from "@src/types";
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

  const updateProfile = useCallback(
    async (request: UpdateUserProfileRequest) => {
      if (!userId) return false;

      try {
        setLoading(true);
        const userProfile = await userProfileService.updateUserProfile(
          userId,
          request
        );
        if (userProfile) {
          setProfile(userProfile);
          return true;
        }
        return false;
      } catch (err) {
        setError("Failed to update user profile");
        console.error("Error updating user profile:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [userId, setLoading, setError]
  );

  const deleteProfile = useCallback(async () => {
    if (!userId) return false;

    try {
      setLoading(true);
      const success = await userProfileService.deleteUserProfile(userId);
      if (success) {
        setProfile(null);
      }
      return success;
    } catch (err) {
      setError("Failed to delete user profile");
      console.error("Error deleting user profile:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId, setLoading, setError]);

  const updateLastLogin = useCallback(async () => {
    if (!userId) return false;

    try {
      setLoading(true);
      const success = await userProfileService.updateLastLogin(userId);
      if (success) {
        await fetchProfile();
      }
      return success;
    } catch (err) {
      setError("Failed to update last login");
      console.error("Error updating last login:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId, setLoading, setError, fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    fetchProfile,
    updateProfile,
    deleteProfile,
    updateLastLogin,
  };
};
