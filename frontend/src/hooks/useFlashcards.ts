import { useState, useCallback, useEffect, useMemo } from "react";
import {
  FlashcardResponse,
  FlashcardRequest,
  FlashcardCategory,
  DifficultyLevel,
} from "@src/types/Flashcard";
import { SubmitFlashcardAnswerRequest } from "@src/types/UserFlashcardStats";
import flashcardService from "@services/data/flashcardService";
import { useFlashcardStats } from "./useFlashcardStats";

interface UseFlashcardsProps {
  categoryId?: string;
  initialIndex?: number;
  userId?: string;
}

export const useFlashcards = ({
  categoryId,
  initialIndex = 0,
  userId,
}: UseFlashcardsProps = {}) => {
  // Data states
  const [flashcards, setFlashcards] = useState<FlashcardResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [flipped, setFlipped] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(
    null
  );
  // Track whether the user has completed all cards in the deck
  const [isDeckCompleted, setIsDeckCompleted] = useState(false);

  // Loading and error states
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the flashcard stats hook for stats-related functionality
  const {
    singleFlashcardStats: currentFlashcardStats,
    isLoading: isLoadingStats,
    getSingleFlashcardStats,
    submitFlashcardAnswer: submitFlashcardAnswerToStats,
  } = useFlashcardStats(userId);

  // Get flashcards from API
  const getFlashcards = useCallback(
    async (request: FlashcardRequest) => {
      setIsLoadingFlashcards(true);
      setError(null);
      // Reset deck completion state when fetching new cards
      setIsDeckCompleted(false);
      try {
        const data = await flashcardService.getFlashcards(request);
        setFlashcards(data);
        setCurrentIndex(initialIndex);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch flashcards";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoadingFlashcards(false);
      }
    },
    [initialIndex]
  );

  // Fetch flashcards for a specific category or difficulty level
  const fetchFlashcards = useCallback(async () => {
    if (!categoryId) return;

    try {
      const numericId = parseInt(categoryId);

      // Determine if it's a difficulty level or a category
      if (numericId >= 0 && numericId <= 2) {
        // It's a difficulty level
        await getFlashcards({
          primaryCategory: FlashcardCategory.AllCategories,
          count: 10,
          difficulty: numericId as DifficultyLevel,
          userId,
        });
      } else {
        // It's a category
        await getFlashcards({
          primaryCategory: numericId as FlashcardCategory,
          count: 10,
          difficulty: DifficultyLevel.Basic,
          userId,
        });
      }
    } catch (err) {
      console.error("Error fetching flashcards:", err);
      setError("Failed to load flashcards. Please try again.");
    }
  }, [categoryId, getFlashcards, userId]);

  // Get current flashcard - use useMemo instead of useCallback to prevent
  // unnecessary recreation of this function
  const currentFlashcard = useMemo((): FlashcardResponse | null => {
    // Don't return a flashcard if we've completed the deck
    if (isDeckCompleted) return null;
    return flashcards.length > 0 ? flashcards[currentIndex] : null;
  }, [flashcards, currentIndex, isDeckCompleted]);

  // Auto-fetch flashcards when categoryId changes
  useEffect(() => {
    if (categoryId) {
      fetchFlashcards();
    }
  }, [categoryId, fetchFlashcards]);

  // Fetch stats when current flashcard changes
  // Only trigger when the flashcard ID changes, not the entire object
  useEffect(() => {
    if (userId && currentFlashcard?.id) {
      getSingleFlashcardStats(currentFlashcard.id);
    }
  }, [userId, currentFlashcard?.id, getSingleFlashcardStats]);

  // Navigation handlers
  const handleFlip = useCallback(() => {
    setFlipped(!flipped);
  }, [flipped]);

  const handleNext = useCallback(() => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    }
  }, [currentIndex, flashcards.length]);

  // Handle answer submission with feedback and navigation
  const handleSubmitAnswer = useCallback(
    async (answer: SubmitFlashcardAnswerRequest) => {
      if (!userId) {
        setError("User ID is required to submit answers");
        return;
      }

      try {
        // Submit the answer using the stats hook
        await submitFlashcardAnswerToStats({
          ...answer,
          userId,
        });

        setSubmissionMessage(
          answer.wasCorrect
            ? "Great job! Moving to the next card..."
            : "Keep practicing! This card will appear again later."
        );

        // Clear message and move to next card after a short delay
        setTimeout(() => {
          setSubmissionMessage(null);
          if (currentIndex < flashcards.length - 1) {
            handleNext();
          } else {
            // Reached the end of the deck
            setIsDeckCompleted(true);
            setSubmissionMessage("You've completed all cards in this deck!");
          }
        }, 1500);
      } catch (err) {
        console.error("Error submitting answer:", err);
        setSubmissionMessage("Error recording your answer. Please try again.");

        // Clear error message after a delay
        setTimeout(() => {
          setSubmissionMessage(null);
        }, 2000);
      }
    },
    [
      userId,
      submitFlashcardAnswerToStats,
      currentIndex,
      flashcards.length,
      handleNext,
    ]
  );

  return {
    // Data
    currentFlashcard,
    currentIndex,
    flipped,
    submissionMessage,
    isDeckCompleted,

    // Stats data
    currentFlashcardStats,
    isLoadingStats,

    // State information
    isLoadingFlashcards,
    error,
    totalCards: flashcards.length,

    // Actions
    fetchFlashcards,
    handleFlip,
    handleSubmitAnswer,
  };
};
