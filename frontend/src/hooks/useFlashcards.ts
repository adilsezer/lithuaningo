import { useState, useCallback } from "react";
import { Flashcard, FlashcardFormData } from "@src/types";
import flashcardService from "@services/data/flashcardService";
import { useAlertDialog } from "@hooks/useAlertDialog";
import {
  useIsLoading,
  useSetLoading,
  useError,
  useSetError,
} from "@stores/useUIStore";

export const useFlashcards = () => {
  const setLoading = useSetLoading();
  const isLoading = useIsLoading();
  const setError = useSetError();
  const error = useError();
  const { showError, showSuccess } = useAlertDialog();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  const handleError = useCallback(
    (error: Error, message: string) => {
      console.error(message, error);
      setError(message);
      showError(message);
      return null;
    },
    [setError, showError]
  );

  const fetchDeckFlashcards = useCallback(
    async (deckId: string) => {
      try {
        setLoading(true);
        setError(null);
        const data = await flashcardService.getDeckFlashcards(deckId);
        setFlashcards(data);
      } catch (error) {
        handleError(error as Error, "Failed to load flashcards");
      } finally {
        setLoading(false);
      }
    },
    [handleError, setError, setLoading]
  );

  const addFlashcardToDeck = useCallback(
    async (deckId: string, flashcard: Omit<Flashcard, "id" | "createdAt">) => {
      try {
        setLoading(true);
        setError(null);
        await flashcardService.addFlashcardToDeck(deckId, flashcard);
        await fetchDeckFlashcards(deckId);
        showSuccess("Flashcard added successfully");
      } catch (error) {
        handleError(error as Error, "Failed to add flashcard");
      } finally {
        setLoading(false);
      }
    },
    [fetchDeckFlashcards, handleError, setError, setLoading, showSuccess]
  );

  const removeFlashcardFromDeck = useCallback(
    async (deckId: string, flashcardId: string) => {
      try {
        setLoading(true);
        setError(null);
        await flashcardService.removeFlashcardFromDeck(deckId, flashcardId);
        await fetchDeckFlashcards(deckId);
        showSuccess("Flashcard removed successfully");
      } catch (error) {
        handleError(error as Error, "Failed to remove flashcard");
      } finally {
        setLoading(false);
      }
    },
    [fetchDeckFlashcards, handleError, setError, setLoading, showSuccess]
  );

  const handleCreateFlashcard = useCallback(
    async (formData: FlashcardFormData, deckId: string, userId: string) => {
      try {
        setLoading(true);
        setError(null);

        const { imageFile, audioFile, ...flashcardData } = formData;

        await flashcardService.createFlashcard(
          {
            ...flashcardData,
            deckId,
            createdBy: userId,
          },
          imageFile,
          audioFile
        );

        showSuccess("Flashcard created successfully");
        return true;
      } catch (error) {
        handleError(error as Error, "Failed to create flashcard");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, handleError, setError, showSuccess]
  );

  return {
    flashcards,
    isLoading,
    error,
    fetchDeckFlashcards,
    addFlashcardToDeck,
    removeFlashcardFromDeck,
    handleCreateFlashcard,
  };
};
