import { useState, useCallback } from "react";
import { useSetLoading } from "@stores/useUIStore";
import { useAlertDialog } from "@hooks/useAlertDialog";
import practiceService from "@services/data/practiceService";

export const usePracticeStats = (deckId: string, userId?: string) => {
  const setLoading = useSetLoading();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState<{ correct: number; total: number }>({
    correct: 0,
    total: 0,
  });

  const { showError, showSuccess } = useAlertDialog();

  const handleAnswer = useCallback(
    async (flashcardId: string, isCorrect: boolean) => {
      if (!userId) {
        showError("Please login to track progress");
        return false;
      }

      try {
        setLoading(true);
        await practiceService.trackProgress({
          userId,
          deckId,
          flashcardId,
          isCorrect,
        });

        const newStats = {
          correct: stats.correct + (isCorrect ? 1 : 0),
          total: stats.total + 1,
        };
        setStats(newStats);

        return true;
      } catch (err) {
        showError("Failed to track progress");
        console.error("Error tracking progress:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [userId, deckId, stats, setLoading]
  );

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setStats({ correct: 0, total: 0 });
  }, []);

  const completeSession = useCallback(() => {
    const percentage = Math.round((stats.correct / stats.total) * 100);
    showSuccess(
      `Practice completed! Score: ${stats.correct}/${stats.total} (${percentage}%)`
    );
    resetSession();
  }, [stats, resetSession]);

  return {
    currentIndex,
    stats,
    setCurrentIndex,
    handleAnswer,
    resetSession,
    completeSession,
  };
};
