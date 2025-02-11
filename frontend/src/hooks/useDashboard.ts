import { useCallback } from "react";
import { useUserData } from "@stores/useUserStore";
import { useIsLoading, useSetError } from "@stores/useUIStore";
import useAnnouncements from "@hooks/useAnnouncements";
import { useUserProfile } from "@hooks/useUserProfile";
import { useIsDarkMode } from "@stores/useThemeStore";
import { parseDate } from "@utils/dateUtils";

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

  const validAnnouncements = announcements.filter((announcement) => {
    if (
      !announcement.title ||
      !announcement.content ||
      !announcement.isActive
    ) {
      return false;
    }

    if (announcement.validUntil) {
      const endDate = parseDate(announcement.validUntil);
      if (endDate && endDate < new Date()) {
        return false;
      }
    }

    return true;
  });

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
