import { useState, useCallback } from "react";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { selectIsLoading } from "@redux/slices/uiSlice";
import useAnnouncements from "@hooks/useAnnouncements";
import { useUserProfile } from "@hooks/useUserProfile";
import { useTheme } from "@src/context/ThemeContext";

export const useDashboard = () => {
  const userData = useAppSelector(selectUserData);
  const announcements = useAnnouncements();
  const { profile } = useUserProfile();
  const { isDarkMode } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const isLoading = useAppSelector(selectIsLoading);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const validAnnouncements = announcements.filter((a) => a.title && a.content);

  return {
    // State
    userData,
    validAnnouncements,
    profile,
    isDarkMode,
    isLoading,
    error,

    // Actions
    clearError,
  };
};
