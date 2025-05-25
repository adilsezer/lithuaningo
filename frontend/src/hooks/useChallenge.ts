import { useState, useCallback } from "react";
import { ChallengeQuestionResponse } from "@src/types";
import ChallengeService from "@services/data/challengeService";

export const useChallenge = () => {
  const [questions, setQuestions] = useState<ChallengeQuestionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDailyChallengeQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ChallengeService.getDailyChallengeQuestions();
      setQuestions(data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch daily challenge questions";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    questions,
    isLoading,
    error,
    getDailyChallengeQuestions,
  };
};
