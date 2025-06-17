import { useState, useCallback } from "react";
import { apiClient } from "@services/api/apiClient";
import { QuestionExplanationRequest } from "@src/types/AI";
import { getErrorMessage } from "@utils/errorMessages";

export const useChallengeExplanation = () => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExplanation = useCallback(
    async (request: QuestionExplanationRequest) => {
      setIsLoading(true);
      setError(null);
      setExplanation(null);
      try {
        const result = await apiClient.explainQuestion(request);
        setExplanation(result);
      } catch (err) {
        const message = getErrorMessage(
          err instanceof Error ? err.message : String(err)
        );
        setError(message);
        console.error("Failed to fetch AI explanation:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearExplanation = useCallback(() => {
    setExplanation(null);
    setError(null);
  }, []);

  return {
    explanation,
    isLoading,
    error,
    fetchExplanation,
    clearExplanation,
  };
};
