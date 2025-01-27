import { useState, useCallback, useEffect } from "react";
import { Flashcard, FlashcardFormData } from "@src/types";
import flashcardService from "@services/data/flashcardService";
import { useAlertDialog } from "@components/ui/AlertDialog";
import {
  useIsLoading,
  useSetLoading,
  useError,
  useSetError,
} from "@stores/useUIStore";
import { Audio } from "expo-av";

export const useFlashcards = () => {
  const setLoading = useSetLoading();
  const isLoading = useIsLoading();
  const setError = useSetError();
  const error = useError();
  const alertDialog = useAlertDialog();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [sound, setSound] = useState<Audio.Sound>();
  const [isPlaying, setIsPlaying] = useState(false);

  // Cleanup sound on unmount
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const handleError = useCallback(
    (error: any, message: string) => {
      console.error(message, error);
      setError(message);
      alertDialog.error(message);
      return null;
    },
    [setError]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const handlePlaySound = useCallback(
    async (url: string) => {
      try {
        if (isPlaying && sound) {
          await sound.pauseAsync();
          setIsPlaying(false);
          return;
        }

        if (sound) {
          await sound.playAsync();
          setIsPlaying(true);
        } else {
          const { sound: newSound } = await Audio.Sound.createAsync({
            uri: url,
          });
          setSound(newSound);
          await newSound.playAsync();
          setIsPlaying(true);

          newSound.setOnPlaybackStatusUpdate(async (status) => {
            if ("didJustFinish" in status && status.didJustFinish) {
              setIsPlaying(false);
            }
          });
        }
      } catch (error) {
        handleError(error, "Error playing sound");
        setIsPlaying(false);
      }
    },
    [sound, isPlaying, handleError]
  );

  const fetchDeckFlashcards = useCallback(
    async (deckId: string) => {
      try {
        setLoading(true);
        clearError();
        const data = await flashcardService.getDeckFlashcards(deckId);
        setFlashcards(data);
      } catch (error) {
        handleError(error, "Failed to load flashcards");
      } finally {
        setLoading(false);
      }
    },
    [handleError, clearError, setLoading]
  );

  const addFlashcardToDeck = useCallback(
    async (deckId: string, flashcard: Omit<Flashcard, "id" | "createdAt">) => {
      try {
        setLoading(true);
        clearError();
        await flashcardService.addFlashcardToDeck(deckId, flashcard);
        await fetchDeckFlashcards(deckId);
      } catch (error) {
        handleError(error, "Failed to add flashcard");
      } finally {
        setLoading(false);
      }
    },
    [fetchDeckFlashcards, handleError, clearError, setLoading]
  );

  const removeFlashcardFromDeck = useCallback(
    async (deckId: string, flashcardId: string) => {
      try {
        setLoading(true);
        clearError();
        await flashcardService.removeFlashcardFromDeck(deckId, flashcardId);
        await fetchDeckFlashcards(deckId);
      } catch (error) {
        handleError(error, "Failed to remove flashcard");
      } finally {
        setLoading(false);
      }
    },
    [fetchDeckFlashcards, handleError, clearError, setLoading]
  );

  const handleCreateFlashcard = useCallback(
    async (formData: FlashcardFormData, deckId: string, userId: string) => {
      try {
        setLoading(true);
        clearError();

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

        alertDialog.success("Flashcard created successfully");
        return true;
      } catch (error) {
        handleError(error, "Failed to create flashcard");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, handleError, clearError]
  );

  return {
    // State
    flashcards,
    isLoading,
    error,
    isPlaying,

    // Actions
    handlePlaySound,
    fetchDeckFlashcards,
    addFlashcardToDeck,
    removeFlashcardFromDeck,
    handleCreateFlashcard,
    clearError,
  };
};
