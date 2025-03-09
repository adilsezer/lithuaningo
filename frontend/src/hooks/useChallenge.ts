import { useEffect, useState } from "react";
import { ChallengeQuestion } from "@src/types";
import { useUserData } from "@stores/useUserStore";
import challengeService from "@src/services/data/challengeService";
import { useUserChallengeStats } from "@src/hooks/useUserChallengeStats";

interface UseChallengeReturn {
  questions: ChallengeQuestion[];
  currentIndex: number;
  currentQuestion: ChallengeQuestion | undefined;
  loading: boolean;
  error: string | null;
  score: number;
  isCorrectAnswer: boolean | null;
  isCompleted: boolean;
  fetchChallenge: (isNew?: boolean) => Promise<void>;
  handleAnswer: (answer: string) => Promise<void>;
  handleNextQuestion: () => Promise<void>;
  getCompletionMessage: () => string;
}

export const useChallenge = (): UseChallengeReturn => {
  const userData = useUserData();
  const [questions, setQuestions] = useState<ChallengeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const {
    stats,
    updateStats,
    updateDailyStreak,
    incrementChallengesCompleted,
  } = useUserChallengeStats(userData?.id);

  // Load challenge questions on mount
  useEffect(() => {
    fetchChallenge();
  }, []);

  // Main function to fetch challenge questions
  const fetchChallenge = async (isNew = false) => {
    try {
      setLoading(true);
      setError(null);

      // Reset states for new challenges
      if (isNew) {
        setCurrentIndex(0);
        setScore(0);
        setIsCorrectAnswer(null);
        setIsCompleted(false);
      }

      // Fetch questions from API
      const challengeQuestions = isNew
        ? await challengeService.generateNewChallenge()
        : await challengeService.getDailyChannel();

      if (challengeQuestions.length === 0) {
        setError("No questions available. Please try again later.");
        return;
      }

      setQuestions(challengeQuestions);
    } catch (err) {
      console.error("Failed to load challenge:", err);
      setError(
        "Failed to load challenge. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle user's answer selection
  const handleAnswer = async (answer: string) => {
    const currentQuestion = questions[currentIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;

    setIsCorrectAnswer(isCorrect);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    // Update stats if user is logged in
    if (stats && userData?.id) {
      await updateStats({
        todayCorrectAnswers: isCorrect
          ? stats.todayCorrectAnswers + 1
          : stats.todayCorrectAnswers,
        todayIncorrectAnswers: !isCorrect
          ? stats.todayIncorrectAnswers + 1
          : stats.todayIncorrectAnswers,
        totalCorrectAnswers: isCorrect
          ? stats.totalCorrectAnswers + 1
          : stats.totalCorrectAnswers,
        totalIncorrectAnswers: !isCorrect
          ? stats.totalIncorrectAnswers + 1
          : stats.totalIncorrectAnswers,
      });
    }
  };

  // Move to next question or complete the challenge
  const handleNextQuestion = async () => {
    setIsCorrectAnswer(null);

    // If more questions, move to next
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
    // Otherwise complete the challenge
    else {
      if (userData?.id) {
        await Promise.all([
          challengeService.submitChallengeResult({
            userId: userData.id,
            deckId: "daily",
            score,
            totalQuestions: questions.length,
          }),
          updateDailyStreak(),
          incrementChallengesCompleted(),
        ]);
      }
      setIsCompleted(true);
    }
  };

  // Get feedback message based on score
  const getCompletionMessage = () => {
    const percentage =
      questions.length > 0 ? (score / questions.length) * 100 : 0;

    if (percentage >= 90)
      return "Puiku! (Excellent!) Your Lithuanian skills are impressive!";
    if (percentage >= 75)
      return "Labai gerai! (Very good!) You're making great progress!";
    if (percentage >= 60)
      return "Gerai! (Good!) Keep practicing to improve your skills.";
    if (percentage >= 40)
      return "Neblogai. (Not bad.) More practice will help you improve.";
    return "Keep learning! Practice makes perfect in Lithuanian.";
  };

  return {
    questions,
    currentIndex,
    currentQuestion: questions[currentIndex],
    loading,
    error,
    score,
    isCorrectAnswer,
    isCompleted,
    fetchChallenge,
    handleAnswer,
    handleNextQuestion,
    getCompletionMessage,
  };
};
