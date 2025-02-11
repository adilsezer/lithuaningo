import { useCallback } from "react";
import { reportService } from "@services/data/reportService";
import { DeckReport } from "@src/types";
import {
  useIsLoading,
  useSetLoading,
  useError,
  useSetError,
} from "@stores/useUIStore";

export const useReport = () => {
  const setLoading = useSetLoading();
  const isLoading = useIsLoading();
  const setError = useSetError();
  const error = useError();

  const submitReport = useCallback(
    async (
      report: Pick<DeckReport, "deckId" | "reporterId" | "reason" | "details">
    ) => {
      try {
        setLoading(true);
        setError(null);
        await reportService.submitReport(report);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to submit report"
        );
        console.error("Error submitting report:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    isLoading,
    error,
    submitReport,
    clearError,
  };
};
