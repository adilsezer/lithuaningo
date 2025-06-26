import { useCallback, useEffect, useState, useMemo } from "react";
import { ChallengeQuestionResponse } from "@src/types";
import { UserFlashcardStatsService } from "@services/data/userFlashcardStatsService";
import ChallengeService from "@services/data/challengeService"; // Assuming this service can fetch category-specific questions
import { useAlertDialog } from "@hooks/useAlertDialog";
import { DifficultyLevel } from "@src/types/Flashcard";

interface UseFlashcardChallengeProps {
  categoryId: string | undefined;
  userId: string | undefined;
  categoryName?: string; // For potential use in titles or context
  difficulty?: number; // DifficultyLevel: Basic=0, Intermediate=1, Advanced=2
}

export const useFlashcardChallenge = ({
  categoryId,
  userId,
  difficulty, // Don't provide a default here anymore
}: UseFlashcardChallengeProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ChallengeQuestionResponse[]>([]);
  // Note: For flashcard challenges, we track individual flashcard performance rather than general challenge stats
  const { showAlert } = useAlertDialog();

  // Auto-detect difficulty level based on categoryId
  const effectiveDifficulty = useMemo(() => {
    if (difficulty !== undefined) {
      return difficulty; // Use explicitly provided difficulty
    }

    // Auto-detect difficulty from categoryId for difficulty categories
    const numericId = parseInt(categoryId || "", 10);
    if (Object.values(DifficultyLevel).includes(numericId as DifficultyLevel)) {
      return numericId;
    }

    // No default difficulty - let backend use all difficulties
    return undefined;
  }, [categoryId, difficulty]);

  // When difficulty categories are selected, we should not filter by categoryId in the backend
  // Instead, we should pass undefined/null for categoryId to get challenges from all categories
  const effectiveCategoryId = useMemo(() => {
    const numericId = parseInt(categoryId || "", 10);
    if (Object.values(DifficultyLevel).includes(numericId as DifficultyLevel)) {
      // For difficulty categories, use AllCategories (-1) to get challenges from all categories
      return "-1";
    }
    // For regular categories, use the categoryId as-is
    return categoryId;
  }, [categoryId]);

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
        const requestParams: {
          count: number;
          categoryId?: string;
          userId: string;
          difficulty?: number;
        } = {
          count: 10,
          userId,
        };

        // Only include categoryId if it's defined
        if (effectiveCategoryId) {
          requestParams.categoryId = effectiveCategoryId;
        }

        // Only include difficulty if it's defined
        if (effectiveDifficulty !== undefined) {
          requestParams.difficulty = effectiveDifficulty;
        }

        const fetchedQuestions =
          await ChallengeService.getReviewChallengeQuestions(requestParams);

        if (fetchedQuestions && fetchedQuestions.length > 0) {
          setQuestions(fetchedQuestions);

          // Check if we got fewer questions than requested (indicating limited flashcards in category)
          if (fetchedQuestions.length < 10) {
            // Show informational alert for partial challenge set
            showAlert({
              title: "Limited Challenge Questions",
              message: `You have ${fetchedQuestions.length} challenge questions available for this category. Practice more flashcards in this category to unlock additional challenges!`,
              buttons: [
                {
                  text: `Continue with ${fetchedQuestions.length} Questions`,
                  onPress: () => {
                    // User continues with available questions
                  },
                },
              ],
            });
          }
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
      } catch (error) {
        // Check if this is specifically the "no flashcards" error
        if (
          error instanceof Error &&
          error.message.includes("No flashcards found")
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
            error instanceof Error
              ? error.message
              : "Failed to load challenge questions."
          );
        }
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, categoryId, effectiveCategoryId, effectiveDifficulty, showAlert]
  );

  useEffect(() => {
    loadChallengeData();
  }, [loadChallengeData]);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = useCallback(
    async (answer: string) => {
      if (!userId || !currentQuestion || isCorrectAnswer !== null) {
        return;
      }

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
        }
      } catch (error) {
        // Optionally set an error state or notify user
        console.warn("Failed to submit flashcard answer:", error);
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
