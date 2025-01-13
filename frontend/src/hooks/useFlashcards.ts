import { useState, useCallback, useEffect } from "react";
import { Flashcard, FlashcardFormData } from "@src/types";
import flashcardService from "@services/data/flashcardService";
import { AlertDialog } from "@components/ui/AlertDialog";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { setLoading, selectIsLoading } from "@redux/slices/uiSlice";
import { Audio } from "expo-av";

export const useFlashcards = () => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [error, setError] = useState<string | null>(null);
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
        console.error("Error playing sound:", error);
        setIsPlaying(false);
      }
    },
    [sound, isPlaying]
  );

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
        dispatch(setLoading(true));
        clearError();
        const data = await flashcardService.getDeckFlashcards(deckId);
        setFlashcards(data);
      } catch (error) {
        handleError(error, "Failed to load flashcards");
      } finally {
        dispatch(setLoading(false));
      }
    },
    [handleError, clearError, dispatch]
  );

  const addFlashcardToDeck = useCallback(
    async (deckId: string, flashcard: Omit<Flashcard, "id" | "createdAt">) => {
      try {
        dispatch(setLoading(true));
        clearError();
        await flashcardService.addFlashcardToDeck(deckId, flashcard);
        await fetchDeckFlashcards(deckId);
      } catch (error) {
        handleError(error, "Failed to add flashcard");
      } finally {
        dispatch(setLoading(false));
      }
    },
    [fetchDeckFlashcards, handleError, clearError, dispatch]
  );

  const removeFlashcardFromDeck = useCallback(
    async (deckId: string, flashcardId: string) => {
      try {
        dispatch(setLoading(true));
        clearError();
        await flashcardService.removeFlashcardFromDeck(deckId, flashcardId);
        await fetchDeckFlashcards(deckId);
      } catch (error) {
        handleError(error, "Failed to remove flashcard");
      } finally {
        dispatch(setLoading(false));
      }
    },
    [fetchDeckFlashcards, handleError, clearError, dispatch]
  );

  const handleCreateFlashcard = useCallback(
    async (formData: FlashcardFormData, deckId: string, userId: string) => {
      try {
        dispatch(setLoading(true));
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

        AlertDialog.success("Flashcard created successfully");
        return true;
      } catch (error) {
        handleError(error, "Failed to create flashcard");
        return false;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, handleError, clearError]
  );

  return {
    // States
    flashcards,
    isLoading,
    error,
    isPlaying,

    // Actions
    clearError,
    fetchDeckFlashcards,
    addFlashcardToDeck,
    removeFlashcardFromDeck,
    handleCreateFlashcard,
    handlePlaySound,
  };
};
