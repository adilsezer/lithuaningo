import { useState, useCallback } from "react";
import { DashboardWord } from "@src/types";
import wordService from "@services/data/wordService";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { setLoading, selectIsLoading } from "@redux/slices/uiSlice";

export const useDashboard = () => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const [wordsData, setWordsData] = useState<DashboardWord[]>([]);

  const fetchRandomWords = useCallback(
    async (count: number = 5) => {
      try {
        dispatch(setLoading(true));
        const words = await wordService.getRandomWords(count);
        setWordsData(words);
      } catch (error) {
        console.error("Error fetching random words:", error);
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  return {
    wordsData,
    isLoading,
    fetchRandomWords,
  };
};
