import { useCallback } from "react";
import { useUserData } from "@stores/useUserStore";
import { useIsLoading, useSetError } from "@stores/useUIStore";
import useAnnouncements from "@hooks/useAnnouncements";
import { useUserProfile } from "@hooks/useUserProfile";
import { useIsDarkMode } from "@stores/useThemeStore";

export const useDashboard = () => {
  const userData = useUserData();
  const setError = useSetError();
  const isLoading = useIsLoading();
  const announcements = useAnnouncements();
  const { profile } = useUserProfile();
  const isDarkMode = useIsDarkMode();

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const validAnnouncements = announcements.filter((a) => a.title && a.content);

  return {
    // State
    userData,
    validAnnouncements,
    profile,
    isDarkMode,
    isLoading,

    // Actions
    clearError,
  };
};
