import { useState, useCallback } from "react";
import { FlashcardResponse, FlashcardRequest } from "@src/types/Flashcard";
import flashcardService from "@services/data/flashcardService";

export const useFlashcards = () => {
  const [flashcards, setFlashcards] = useState<FlashcardResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFlashcards = useCallback(async (request: FlashcardRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await flashcardService.getFlashcards(request);
      setFlashcards(data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch flashcards";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    flashcards,
    isLoading,
    error,
    getFlashcards,
  };
};
