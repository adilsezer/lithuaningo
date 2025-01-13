import { useState, useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { setLoading, selectIsLoading } from "@redux/slices/uiSlice";
import useAnnouncements from "@hooks/useAnnouncements";
import { useUserProfile } from "@hooks/useUserProfile";
import { useTheme } from "@src/context/ThemeContext";
import wordService from "@services/data/wordService";
import { DashboardWord } from "@src/types";
import { AlertDialog } from "@components/ui/AlertDialog";

export const useDashboard = () => {
  const dispatch = useAppDispatch();
  const userData = useAppSelector(selectUserData);
  const announcements = useAnnouncements();
  const { profile } = useUserProfile();
  const { isDarkMode } = useTheme();
  const [wordsData, setWordsData] = useState<DashboardWord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isLoading = useAppSelector(selectIsLoading);

  const handleError = useCallback((error: any, message: string) => {
    console.error(message, error);
    setError(message);
    AlertDialog.error(message);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      clearError();
      const words = await wordService.getRandomWords(5);
      setWordsData(words);
      return true;
    } catch (error) {
      handleError(error, "Error fetching dashboard data");
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, handleError, clearError]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const validAnnouncements = announcements.filter((a) => a.title && a.content);

  return {
    // State
    userData,
    validAnnouncements,
    profile,
    isDarkMode,
    wordsData,
    isLoading,
    error,

    // Actions
    clearError,
    fetchDashboardData,
  };
};
