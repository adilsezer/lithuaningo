import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { setLoading, selectIsLoading } from "@redux/slices/uiSlice";
import useAnnouncements from "@hooks/useAnnouncements";
import { useUserProfile } from "@hooks/useUserProfile";
import { useTheme } from "@src/context/ThemeContext";
import wordService from "@services/data/wordService";
import { DashboardWord } from "@src/types";

export const useDashboard = () => {
  const dispatch = useAppDispatch();
  const userData = useAppSelector(selectUserData);
  const announcements = useAnnouncements();
  const { profile } = useUserProfile();
  const { isDarkMode } = useTheme();
  const [wordsData, setWordsData] = useState<DashboardWord[]>([]);
  const isLoading = useAppSelector(selectIsLoading);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setLoading(true));
        const words = await wordService.getRandomWords(5);
        setWordsData(words);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchData();
  }, [dispatch]);

  const validAnnouncements = announcements.filter((a) => a.title && a.content);

  return {
    userData,
    validAnnouncements,
    profile,
    isDarkMode,
    wordsData,
    isLoading,
  };
};
