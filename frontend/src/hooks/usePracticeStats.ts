import { useState, useCallback } from "react";
import { useSetLoading } from "@stores/useUIStore";
import { useAlertDialog } from "@hooks/useAlertDialog";
import practiceService from "@services/data/practiceService";

interface Stats {
  correct: number;
  total: number;
}

export const usePracticeStats = (deckId: string, userId?: string) => {
  const setLoading = useSetLoading();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState<Stats>({ correct: 0, total: 0 });
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
        setStats((prevStats) => ({
          correct: prevStats.correct + (isCorrect ? 1 : 0),
          total: prevStats.total + 1,
        }));
        return true;
      } catch (error) {
        console.error("Error tracking progress:", error);
        showError("Failed to track progress");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [userId, deckId, setLoading, showError]
  );

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setStats({ correct: 0, total: 0 });
  }, []);

  const completeSession = useCallback(() => {
    const percentage = stats.total
      ? Math.round((stats.correct / stats.total) * 100)
      : 0;
    showSuccess(
      `Practice completed! Score: ${stats.correct}/${stats.total} (${percentage}%)`
    );
    resetSession();
  }, [stats, resetSession, showSuccess]);

  return {
    currentIndex,
    stats,
    setCurrentIndex,
    handleAnswer,
    resetSession,
    completeSession,
  };
};
