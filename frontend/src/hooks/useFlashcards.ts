import { useState, useCallback, useEffect } from "react";
import {
  FlashcardResponse,
  FlashcardRequest,
  FlashcardCategory,
  DifficultyLevel,
} from "@src/types/Flashcard";
import {
  SubmitFlashcardAnswerRequest,
  UserFlashcardStatResponse,
} from "@src/types/UserFlashcardStats";
import flashcardService from "@services/data/flashcardService";
import { UserFlashcardStatsService } from "@services/data/userFlashcardStatsService";

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

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get flashcards from API
  const getFlashcards = useCallback(
    async (request: FlashcardRequest) => {
      setIsLoading(true);
      setError(null);
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
        setIsLoading(false);
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

  // Auto-fetch flashcards when categoryId changes
  useEffect(() => {
    if (categoryId) {
      fetchFlashcards();
    }
  }, [categoryId, fetchFlashcards]);

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

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
    }
  }, [currentIndex]);

  // Answer submission
  const submitFlashcardAnswer = useCallback(
    async (
      request: SubmitFlashcardAnswerRequest
    ): Promise<UserFlashcardStatResponse | null> => {
      if (!userId) {
        setError("User ID is required to submit answers");
        return null;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const data = await UserFlashcardStatsService.submitFlashcardAnswer({
          ...request,
          userId,
        });
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to submit flashcard answer";
        setError(errorMessage);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [userId]
  );

  // Handle answer submission with feedback and navigation
  const handleSubmitAnswer = useCallback(
    async (answer: SubmitFlashcardAnswerRequest) => {
      try {
        await submitFlashcardAnswer(answer);

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
    [submitFlashcardAnswer, currentIndex, flashcards.length, handleNext]
  );

  // Get current flashcard
  const getCurrentFlashcard = useCallback((): FlashcardResponse | null => {
    return flashcards.length > 0 ? flashcards[currentIndex] : null;
  }, [flashcards, currentIndex]);

  return {
    // Data
    flashcards,
    currentFlashcard: getCurrentFlashcard(),
    currentIndex,
    flipped,
    submissionMessage,

    // State information
    isLoading,
    isSubmitting,
    error,
    totalCards: flashcards.length,
    hasNext: currentIndex < flashcards.length - 1,
    hasPrevious: currentIndex > 0,

    // Actions
    getFlashcards,
    fetchFlashcards,
    handleFlip,
    handleNext,
    handlePrevious,
    submitFlashcardAnswer,
    handleSubmitAnswer,
  };
};
