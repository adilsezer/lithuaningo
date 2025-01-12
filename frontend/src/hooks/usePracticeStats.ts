import { useState, useCallback } from "react";
import { PracticeStats } from "@src/types";
import apiClient from "@services/api/apiClient";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { setLoading, selectIsLoading } from "@redux/slices/uiSlice";

export const usePracticeStats = (deckId: string, userId: string) => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const [stats, setStats] = useState<PracticeStats | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const data = await apiClient.getPracticeStats(deckId, userId);
      setStats(data);
    } catch (err) {
      console.error("Error loading practice stats:", err);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, deckId, userId]);

  return {
    stats,
    isLoading,
    fetchStats,
  };
};
