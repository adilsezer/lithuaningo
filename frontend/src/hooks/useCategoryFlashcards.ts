import { useState, useCallback, useEffect } from "react";
import { useFlashcardNavigation } from "./useFlashcardNavigation";
import { useFlashcardStats } from "./useFlashcardStats";
import { SubmitFlashcardAnswerRequest } from "@src/types/UserFlashcardStats";

interface UseCategoryFlashcardsProps {
  id: string;
}

export const useCategoryFlashcards = ({ id }: UseCategoryFlashcardsProps) => {
  const {
    currentFlashcard,
    currentIndex,
    flipped,
    isLoadingFlashcards,
    error,
    fetchFlashcards,
    handleFlip,
    handleNext,
    totalCards,
    hasNext,
  } = useFlashcardNavigation({ id });

  const { submitFlashcardAnswer, isLoading: isSubmitting } =
    useFlashcardStats();
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(
    null
  );

  // Fetch flashcards when id changes
  useEffect(() => {
    fetchFlashcards();
  }, [id]);

  // Handle answer submission
  const handleSubmitAnswer = useCallback(
    async (answer: SubmitFlashcardAnswerRequest) => {
      try {
        await submitFlashcardAnswer(answer);
        setSubmissionMessage(
          answer.wasCorrect
            ? "Great job! Moving to next card..."
            : "Keep practicing! Moving to next card..."
        );

        // Clear message and move to next card after a short delay
        setTimeout(() => {
          setSubmissionMessage(null);
          if (hasNext) {
            handleNext();
          } else {
            // Reached the end of the deck
            setSubmissionMessage("You've completed all cards in this deck!");
          }
        }, 1500);
      } catch (error) {
        console.error("Error submitting answer:", error);
        setSubmissionMessage("Error recording your answer. Please try again.");

        // Clear error message after a delay
        setTimeout(() => {
          setSubmissionMessage(null);
        }, 2000);
      }
    },
    [submitFlashcardAnswer, hasNext, handleNext]
  );

  return {
    // Flashcard data
    currentFlashcard,
    currentIndex,
    flipped,
    totalCards,

    // Loading and error states
    isLoadingFlashcards,
    isSubmitting,
    error,

    // Message state
    submissionMessage,

    // Action handlers
    fetchFlashcards,
    handleFlip,
    handleSubmitAnswer,
  };
};
