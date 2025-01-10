import { useState, useCallback } from "react";
import { Flashcard } from "@src/types";
import flashcardService from "@services/data/flashcardService";
import { AlertDialog } from "@components/ui/AlertDialog";

export const useFlashcards = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: any, message: string) => {
    console.error(message, error);
    setError(message);
    AlertDialog.error(message);
    return null;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchDeckFlashcards = useCallback(
    async (deckId: string) => {
      try {
        setIsLoading(true);
        clearError();
        const data = await flashcardService.getDeckFlashcards(deckId);
        setFlashcards(data);
      } catch (error) {
        handleError(error, "Failed to load flashcards");
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, clearError]
  );

  const addFlashcardToDeck = useCallback(
    async (deckId: string, flashcard: Omit<Flashcard, "id" | "createdAt">) => {
      try {
        setIsLoading(true);
        clearError();
        await flashcardService.addFlashcardToDeck(deckId, flashcard);
        await fetchDeckFlashcards(deckId);
      } catch (error) {
        handleError(error, "Failed to add flashcard");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchDeckFlashcards, handleError, clearError]
  );

  const removeFlashcardFromDeck = useCallback(
    async (deckId: string, flashcardId: string) => {
      try {
        setIsLoading(true);
        clearError();
        await flashcardService.removeFlashcardFromDeck(deckId, flashcardId);
        await fetchDeckFlashcards(deckId);
      } catch (error) {
        handleError(error, "Failed to remove flashcard");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchDeckFlashcards, handleError, clearError]
  );

  return {
    // States
    flashcards,
    isLoading,
    error,

    // Actions
    clearError,
    fetchDeckFlashcards,
    addFlashcardToDeck,
    removeFlashcardFromDeck,
  };
};
