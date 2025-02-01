import { useState, useCallback, useEffect } from "react";
import { Flashcard, FlashcardFormData } from "@src/types";
import flashcardService from "@services/data/flashcardService";
import { useAlertDialog } from "@hooks/useAlertDialog";
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
  const { showError, showSuccess } = useAlertDialog();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (sound) {
        console.log("Unloading Sound");
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handleError = useCallback(
    (error: Error, message: string) => {
      console.error(message, error);
      setError(message);
      showError(message);
      return null;
    },
    [setError, showError]
  );

  const handlePlaySound = useCallback(
    async (url: string) => {
      try {
        // First, set up the audio mode
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        // If we're already playing this URL, stop it
        if (playingUrl === url && sound) {
          console.log("Pausing Sound");
          await sound.pauseAsync();
          setPlayingUrl(null);
          return;
        }

        // Always unload the previous sound before creating a new one
        if (sound) {
          console.log("Unloading previous sound");
          try {
            await sound.pauseAsync();
            await sound.unloadAsync();
          } catch (error) {
            console.log("Error cleaning up previous sound:", error);
          }
          setSound(null);
        }

        console.log("Loading Sound");
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true },
          async (status) => {
            if (!status.isLoaded) {
              if (status.error) {
                console.log(
                  `Encountered a fatal error during playback: ${status.error}`
                );
                setPlayingUrl(null);
                if (sound) {
                  try {
                    await sound.unloadAsync();
                  } catch (error) {
                    console.log("Error unloading sound:", error);
                  }
                }
                setSound(null);
                return;
              }
            }

            // Handle playback finished
            if (status.isLoaded && status.didJustFinish) {
              console.log("Playback finished");
              setPlayingUrl(null);
            }
          },
          true
        );

        setSound(newSound);
        setPlayingUrl(url);
        console.log("Sound is now playing");
      } catch (error) {
        handleError(error as Error, "Error playing audio");
        if (sound) {
          try {
            await sound.pauseAsync();
            await sound.unloadAsync();
          } catch (unloadError) {
            console.log("Error unloading sound:", unloadError);
          }
        }
        setSound(null);
        setPlayingUrl(null);
      }
    },
    [sound, playingUrl, handleError]
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
    isPlaying: (url: string) => playingUrl === url,
    handlePlaySound,
    fetchDeckFlashcards,
    addFlashcardToDeck,
    removeFlashcardFromDeck,
    handleCreateFlashcard,
  };
};
