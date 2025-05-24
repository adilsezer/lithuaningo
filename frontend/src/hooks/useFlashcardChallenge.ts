import { useCallback, useEffect, useState } from "react";
import { ChallengeQuestionResponse } from "@src/types";
import { UserFlashcardStatsService } from "@services/data/userFlashcardStatsService";
import ChallengeService from "@services/data/challengeService"; // Assuming this service can fetch category-specific questions
import { useAlertDialog } from "@hooks/useAlertDialog";

interface UseFlashcardChallengeProps {
  categoryId: string | undefined;
  userId: string | undefined;
  categoryName?: string; // For potential use in titles or context
}

export const useFlashcardChallenge = ({
  categoryId,
  userId,
}: UseFlashcardChallengeProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ChallengeQuestionResponse[]>([]);
  // Note: For flashcard challenges, we track individual flashcard performance rather than general challenge stats
  const { showAlert } = useAlertDialog();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const loadChallengeData = useCallback(
    async (isRetry = false) => {
      if (!userId) {
        setError("User ID is required to start the challenge.");
        setIsLoading(false);
        return;
      }
      if (!categoryId) {
        setError("Category ID is required to load the challenge.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      if (isRetry) {
        setCurrentIndex(0);
        setScore(0);
        setIsCorrectAnswer(null);
        setIsCompleted(false);
      }

      try {
        // Fetch category-specific review challenge questions
        const fetchedQuestions =
          await ChallengeService.getReviewChallengeQuestions({
            count: 10,
            categoryId,
            userId,
          });

        if (fetchedQuestions && fetchedQuestions.length > 0) {
          setQuestions(fetchedQuestions);
        } else {
          setQuestions([]);
          // Show specific alert for insufficient flashcards
          showAlert({
            title: "Practice More Flashcards",
            message:
              "You need to practice more flashcards in this category before you can start the Master challenge. Try studying some flashcards first!",
            buttons: [
              {
                text: "OK",
                onPress: () => {
                  // User can navigate back or the component will handle this
                },
              },
            ],
          });
          // Don't set this as an error - it's a normal state
        }

        // Optionally, load user stats specific to this category challenge if applicable
        // For now, we'll skip category-specific stats loading to keep it simple
        // const userStats = await UserChallengeStatsService.getUserChallengeStatsForCategory(userId, categoryId);
        // setStats(userStats);

        if (!isRetry) {
          // Reset progress for a new challenge session
          setCurrentIndex(0);
          setScore(0);
        }
      } catch (err) {
        console.error("Failed to load flashcard challenge data:", err);

        // Check if this is specifically the "no flashcards" error
        if (
          err instanceof Error &&
          err.message.includes("No flashcards found")
        ) {
          showAlert({
            title: "Practice More Flashcards",
            message:
              "You need to practice more flashcards in this category before you can start the Master challenge. Try studying some flashcards first!",
            buttons: [
              {
                text: "OK",
                onPress: () => {
                  // User can navigate back or the component will handle this
                },
              },
            ],
          });
          // Don't set this as an error - it's a normal state
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load challenge questions."
          );
        }
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, categoryId, showAlert]
  );

  useEffect(() => {
    loadChallengeData();
  }, [loadChallengeData]);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = useCallback(
    async (answer: string) => {
      if (!userId || !currentQuestion || isCorrectAnswer !== null) return;

      const isCorrect = answer === currentQuestion.correctAnswer;
      setIsCorrectAnswer(isCorrect);
      if (isCorrect) {
        setScore((prev) => prev + 1);
      }

      // Track performance against the specific flashcard this challenge question is testing
      // Since these are challenge questions generated from flashcards the user has seen,
      // we should track this as flashcard learning progress for spaced repetition
      try {
        if (currentQuestion.flashcardId) {
          await UserFlashcardStatsService.submitFlashcardAnswer({
            flashcardId: currentQuestion.flashcardId,
            wasCorrect: isCorrect,
            userId,
          });
        } else {
          console.warn(
            "Challenge question missing flashcardId - cannot track flashcard performance"
          );
        }
      } catch (err) {
        console.error("Failed to submit flashcard challenge answer:", err);
        // Optionally set an error state or notify user
      }
    },
    [userId, currentQuestion, isCorrectAnswer]
  );

  const handleNextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsCorrectAnswer(null);
    } else {
      setIsCompleted(true);
    }
  }, [currentIndex, questions.length]);

  const handleRetry = useCallback(() => {
    loadChallengeData(true);
  }, [loadChallengeData]);

  return {
    isLoading,
    error,
    questions,
    currentQuestion,
    currentIndex,
    score,
    isCorrectAnswer,
    isCompleted,
    handleAnswer,
    handleNextQuestion,
    handleRetry,
    // stats, // if you decide to load/use stats
  };
};
