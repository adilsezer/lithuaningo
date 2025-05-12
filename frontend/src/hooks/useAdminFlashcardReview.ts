import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { adminFlashcardService } from "@services/admin/adminFlashcardService";
import {
  FlashcardResponse,
  UpdateFlashcardAdminRequest,
} from "@src/types/Flashcard";
import { getErrorMessage } from "@utils/errorMessages";

// Simple console logger as a snackbar placeholder
const showSnackbar = (
  message: string,
  type: "info" | "success" | "error" = "info"
) => {
  console.log(`[Snackbar-${type.toUpperCase()}] ${message}`);
};

export const useAdminFlashcardReview = () => {
  const router = useRouter();
  // const showSnackbar = useSnackbar(); // Replaced with console log

  const [flashcards, setFlashcards] = useState<FlashcardResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentFlashcardData, setCurrentFlashcardData] =
    useState<UpdateFlashcardAdminRequest | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false); // For update/verify actions
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false); // For regenerate actions
  const [error, setError] = useState<string | null>(null);

  // Memoize the current flashcard based on index
  const currentFlashcard = useMemo(() => {
    return flashcards.length > currentIndex ? flashcards[currentIndex] : null;
  }, [flashcards, currentIndex]);

  // Effect to load flashcards on mount
  useEffect(() => {
    loadFlashcards();
  }, []);

  // Effect to update editable data when the current flashcard changes
  useEffect(() => {
    if (currentFlashcard) {
      // Manually create the editable data object instead of cloning
      const editableData: UpdateFlashcardAdminRequest = {
        frontText: currentFlashcard.frontText,
        backText: currentFlashcard.backText,
        exampleSentence: currentFlashcard.exampleSentence || "", // Ensure defaults for optional fields
        exampleSentenceTranslation:
          currentFlashcard.exampleSentenceTranslation || "",
        imageUrl: currentFlashcard.imageUrl || "",
        audioUrl: currentFlashcard.audioUrl || "",
        notes: currentFlashcard.notes || "",
        // Ensure categories and difficulty are handled correctly
        // If categories can be null/undefined in FlashcardResponse but required in UpdateRequest, provide default
        categories: currentFlashcard.categories || [],
        difficulty: currentFlashcard.difficulty, // Assuming DifficultyLevel enum aligns
        isVerified: currentFlashcard.isVerified,
      };
      setCurrentFlashcardData(editableData);
    } else {
      setCurrentFlashcardData(null);
    }
  }, [currentFlashcard]);

  // Function to load unverified flashcards
  const loadFlashcards = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedFlashcards =
        await adminFlashcardService.fetchUnverifiedFlashcards();
      setFlashcards(fetchedFlashcards);
      setCurrentIndex(0);
      if (fetchedFlashcards.length === 0) {
        showSnackbar("No unverified flashcards found.", "info");
      }
    } catch (err) {
      const message = getErrorMessage(
        err instanceof Error ? err.message : String(err)
      );
      setError(message);
      showSnackbar(`Error loading flashcards: ${message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update a field in the current editable flashcard data
  const updateField = useCallback(
    <K extends keyof UpdateFlashcardAdminRequest>(
      field: K,
      value: UpdateFlashcardAdminRequest[K]
    ) => {
      setCurrentFlashcardData((prev) =>
        prev ? { ...prev, [field]: value } : null
      );
    },
    []
  );

  // Go to the next flashcard or finish
  const advanceToNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      showSnackbar("All flashcards reviewed!", "success");
      // Optionally navigate back or show a completion message
      router.back();
    }
  };

  // Handle verifying the current flashcard and moving to the next
  const handleVerifyAndNext = async () => {
    if (!currentFlashcard || !currentFlashcardData) return;

    setIsUpdating(true);
    setError(null);
    try {
      const updateData = { ...currentFlashcardData, isVerified: true };
      await adminFlashcardService.updateFlashcard(
        currentFlashcard.id,
        updateData
      );
      showSnackbar(
        `Flashcard "${currentFlashcard.frontText}" verified.`,
        "success"
      );
      advanceToNext();
    } catch (err) {
      const message = getErrorMessage(
        err instanceof Error ? err.message : String(err)
      );
      setError(message);
      showSnackbar(`Error verifying flashcard: ${message}`, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle skipping the current flashcard
  const handleSkip = () => {
    advanceToNext();
  };

  // Handle regenerating the image
  const handleRegenerateImage = async () => {
    if (!currentFlashcard) return;

    setIsRegenerating(true);
    setError(null);
    try {
      const newImageUrl = await adminFlashcardService.regenerateImage(
        currentFlashcard.id
      );
      updateField("imageUrl", newImageUrl);
      showSnackbar("Image regenerated successfully.", "success");
    } catch (err) {
      const message = getErrorMessage(
        err instanceof Error ? err.message : String(err)
      );
      setError(message);
      showSnackbar(`Error regenerating image: ${message}`, "error");
    } finally {
      setIsRegenerating(false);
    }
  };

  // Handle regenerating the audio
  const handleRegenerateAudio = async () => {
    if (!currentFlashcard) return;

    setIsRegenerating(true);
    setError(null);
    try {
      const newAudioUrl = await adminFlashcardService.regenerateAudio(
        currentFlashcard.id
      );
      updateField("audioUrl", newAudioUrl);
      showSnackbar("Audio regenerated successfully.", "success");
    } catch (err) {
      const message = getErrorMessage(
        err instanceof Error ? err.message : String(err)
      );
      setError(message);
      showSnackbar(`Error regenerating audio: ${message}`, "error");
    } finally {
      setIsRegenerating(false);
    }
  };

  // Handle completing the review session
  const handleComplete = () => {
    router.back();
  };

  return {
    // State
    flashcards,
    currentIndex,
    currentFlashcardData,
    currentFlashcard, // The original data for display
    isLoading,
    isUpdating,
    isRegenerating,
    error,

    // Actions
    updateField,
    handleVerifyAndNext,
    handleSkip,
    handleRegenerateImage,
    handleRegenerateAudio,
    handleComplete,
    loadFlashcards, // Expose load function if manual refresh is needed
  };
};
