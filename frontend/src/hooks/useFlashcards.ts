import { useState, useCallback } from "react";
import {
  Flashcard,
  CreateFlashcardRequest,
  UpdateFlashcardRequest,
  ImageFile,
  AudioFile,
} from "@src/types";
import flashcardService from "@src/services/data/flashcardService";
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
  const { showError, showSuccess, showConfirm } = useAlertDialog();
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

  const getDeckFlashcards = useCallback(
    async (deckId: string) => {
      try {
        setLoading(true);
        setError(null);
        const data = await flashcardService.getDeckFlashcards(deckId);
        setFlashcards(data);
        return data;
      } catch (error) {
        handleError(error as Error, "Failed to load flashcards");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [handleError, setError, setLoading]
  );

  const createFlashcard = useCallback(
    async (
      flashcard: Omit<CreateFlashcardRequest, "imageUrl" | "audioUrl">,
      imageFile?: ImageFile,
      audioFile?: AudioFile
    ) => {
      try {
        setLoading(true);
        setError(null);
        await flashcardService.createFlashcard(flashcard, imageFile, audioFile);
        showSuccess("Flashcard created successfully");
        return true;
      } catch (error) {
        handleError(error as Error, "Failed to create flashcard");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [handleError, setError, setLoading, showSuccess]
  );

  const updateFlashcard = useCallback(
    async (
      id: string,
      flashcard: Omit<UpdateFlashcardRequest, "imageUrl" | "audioUrl">,
      imageFile?: ImageFile,
      audioFile?: AudioFile,
      currentImageUrl?: string,
      currentAudioUrl?: string
    ) => {
      try {
        setLoading(true);
        setError(null);
        await flashcardService.updateFlashcard(
          id,
          flashcard,
          imageFile,
          audioFile,
          currentImageUrl,
          currentAudioUrl
        );
        showSuccess("Flashcard updated successfully");
        return true;
      } catch (error) {
        handleError(error as Error, "Failed to update flashcard");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [handleError, setError, setLoading, showSuccess]
  );

  const deleteFlashcard = useCallback(
    async (id: string, onSuccess?: () => void) => {
      showConfirm({
        title: "Delete Flashcard",
        message:
          "Are you sure you want to delete this flashcard? This cannot be undone.",
        onConfirm: async () => {
          try {
            setLoading(true);
            setError(null);
            await flashcardService.deleteFlashcard(id);
            showSuccess("Flashcard deleted successfully");

            if (onSuccess) {
              onSuccess();
            }
          } catch (error) {
            handleError(error as Error, "Failed to delete flashcard");
            throw error;
          } finally {
            setLoading(false);
          }
        },
      });
    },
    [handleError, setError, setLoading, showSuccess, showConfirm]
  );

  const getFlashcardById = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        return await flashcardService.getFlashcardById(id);
      } catch (error) {
        handleError(error as Error, "Failed to fetch flashcard");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [handleError, setError, setLoading]
  );

  return {
    flashcards,
    isLoading,
    error,
    getDeckFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    getFlashcardById,
  };
};
