import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { View, StyleSheet, Animated, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useFlashcards } from "@hooks/useFlashcards";
import { FlashcardView } from "@components/flashcard/FlashcardView";
import CustomText from "@components/ui/CustomText";
import {
  useTheme,
  ProgressBar,
  Button,
  Surface,
  IconButton,
} from "react-native-paper";
import { LoadingIndicator } from "@components/ui/LoadingIndicator";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import HeaderWithBackButton from "@components/layout/HeaderWithBackButton";
import { Flashcard } from "@src/types";
import { StatsPanel } from "@components/deck/PracticeStats";
import { CompletedScreen } from "@components/deck/PracticeCompleted";
import { PracticeStats, TrendAnalysis } from "../../../types/practiceTypes";

// The number of recent answers to track for trend analysis
const RECENT_ANSWERS_COUNT = 5;

// Main component for the practice screen
export default function PracticeScreen() {
  const { id } = useLocalSearchParams();
  const { getDeckFlashcards, flashcards, error, isLoading } = useFlashcards();
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingCards, setRemainingCards] = useState<Flashcard[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const fadeAnim = useState(new Animated.Value(1))[0];
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [answerTimes, setAnswerTimes] = useState<number[]>([]);
  const [lastAnswerTime, setLastAnswerTime] = useState<number | null>(null);
  const [recentAnswers, setRecentAnswers] = useState<boolean[]>([]);
  const [statsTab, setStatsTab] = useState("main");
  const [timeRefresh, setTimeRefresh] = useState(0);
  const [finalSessionDuration, setFinalSessionDuration] = useState<string>("");
  const [finalLearningPace, setFinalLearningPace] = useState<number>(0);
  const [finalResponseTime, setFinalResponseTime] = useState<number>(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);

  // Force a refresh of time-based stats every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRefresh((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Capture the final session duration when practice is completed
  useEffect(() => {
    if (isCompleted) {
      setFinalSessionDuration(getSessionDuration());
      setFinalLearningPace(getLearningPace());
      setFinalResponseTime(getAverageResponseTime());
    }
  }, [isCompleted]);

  useEffect(() => {
    if (id) {
      getDeckFlashcards(id as string).then((cards: Flashcard[]) => {
        if (cards) {
          setRemainingCards([...cards]);
        }
      });
    }
  }, [id, getDeckFlashcards]);

  // Auto-scroll when shouldAutoScroll is set to true
  useEffect(() => {
    if (shouldAutoScroll && scrollViewRef.current) {
      // Scroll to make buttons visible
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
        setShouldAutoScroll(false);
      }, 300);
    }
  }, [shouldAutoScroll]);

  const animateTransition = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.4,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getSessionDuration = () => {
    const durationMs = Date.now() - sessionStartTime;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const getPerformanceLabel = () => {
    if (totalAnswered === 0) return "Just started";
    const accuracy = (correctCount / totalAnswered) * 100;
    if (accuracy >= 90) return "Excellent";
    if (accuracy >= 75) return "Good";
    if (accuracy >= 60) return "Fair";
    return "Keep practicing";
  };

  // Calculate learning pace (cards per minute)
  const getLearningPace = () => {
    if (totalAnswered === 0) return 0;
    const durationMinutes = (Date.now() - sessionStartTime) / 60000;
    return durationMinutes > 0
      ? parseFloat((totalAnswered / durationMinutes).toFixed(1))
      : totalAnswered;
  };

  // Calculate estimated time to finish (in minutes)
  const getEstimatedTimeToFinish = () => {
    const pace = getLearningPace();
    if (pace === 0 || remainingCards.length === 0) return "0 min";

    const estimatedMinutes = remainingCards.length / pace;
    if (estimatedMinutes < 1) {
      return "< 1 min";
    } else if (estimatedMinutes > 60) {
      return `${Math.round(estimatedMinutes / 60)} hr ${Math.round(
        estimatedMinutes % 60
      )} min`;
    } else {
      return `${Math.round(estimatedMinutes)} min`;
    }
  };

  // Calculate average response time
  const getAverageResponseTime = () => {
    if (answerTimes.length === 0) return 0;
    const sum = answerTimes.reduce((acc, time) => acc + time, 0);
    return parseFloat((sum / answerTimes.length / 1000).toFixed(1));
  };

  // Get trend analysis (comparing recent performance to overall)
  const getTrendAnalysis = useMemo((): TrendAnalysis => {
    if (
      recentAnswers.length < RECENT_ANSWERS_COUNT ||
      totalAnswered <= RECENT_ANSWERS_COUNT
    ) {
      return {
        trend: "stable",
        description: "Not enough data",
        icon: "trending-neutral",
        color: theme.colors.onSurfaceVariant,
      };
    }

    const recentCorrect = recentAnswers.filter(Boolean).length;
    const recentAccuracy = (recentCorrect / recentAnswers.length) * 100;
    const overallAccuracy = (correctCount / totalAnswered) * 100;
    const difference = recentAccuracy - overallAccuracy;

    if (difference >= 10) {
      return {
        trend: "improving",
        description: `Improving (+${difference.toFixed(0)}%)`,
        icon: "trending-up",
        color: theme.colors.primary,
      };
    } else if (difference <= -10) {
      return {
        trend: "declining",
        description: `Declining (${difference.toFixed(0)}%)`,
        icon: "trending-down",
        color: theme.colors.error,
      };
    } else {
      return {
        trend: "stable",
        description: "Stable performance",
        icon: "trending-neutral",
        color: theme.colors.onSurfaceVariant,
      };
    }
  }, [recentAnswers, totalAnswered, correctCount, theme.colors]);

  const handleAnswer = useCallback(
    async (isCorrect: boolean) => {
      try {
        const currentCard = remainingCards[currentIndex];
        if (!currentCard) return;

        // Track answer time if this isn't the first card
        const now = Date.now();
        if (lastAnswerTime !== null) {
          const responseTime = now - lastAnswerTime;
          setAnswerTimes((prev) => [...prev, responseTime]);
        }
        setLastAnswerTime(now);

        // Update recent answers for trend analysis
        setRecentAnswers((prev) => {
          const newAnswers = [...prev, isCorrect];
          if (newAnswers.length > RECENT_ANSWERS_COUNT) {
            newAnswers.shift(); // Remove oldest entry
          }
          return newAnswers;
        });

        setTotalAnswered((prev) => prev + 1);

        // Start animation
        animateTransition();

        if (isCorrect) {
          setCorrectCount((prev) => prev + 1);
          setCurrentStreak((prev) => prev + 1);
          setBestStreak((prev) => Math.max(prev, currentStreak + 1));

          // Remove the correct card from remaining cards
          const updatedCards = [...remainingCards];
          updatedCards.splice(currentIndex, 1);
          setRemainingCards(updatedCards);

          // Check if all cards are completed
          if (updatedCards.length === 0) {
            setIsCompleted(true);
            // Capture final values
            setFinalSessionDuration(getSessionDuration());
            setFinalLearningPace(getLearningPace());
            setFinalResponseTime(getAverageResponseTime());
            return;
          }

          // Adjust current index if needed
          if (currentIndex >= updatedCards.length) {
            setCurrentIndex(0);
          }
        } else {
          // Reset streak on incorrect answer
          setCurrentStreak(0);

          // Move the incorrect card to the end of the deck
          const updatedCards = [...remainingCards];
          const incorrectCard = updatedCards.splice(currentIndex, 1)[0];
          updatedCards.push(incorrectCard);
          setRemainingCards(updatedCards);

          // Adjust current index if needed
          if (currentIndex >= updatedCards.length - 1) {
            setCurrentIndex(0);
          }
        }
      } catch (error) {
        console.error("Error updating flashcard stats:", error);
      }
    },
    [currentIndex, remainingCards, currentStreak, lastAnswerTime]
  );

  const handleRestartPractice = () => {
    setRemainingCards([...flashcards]);
    setCurrentIndex(0);
    setCorrectCount(0);
    setTotalAnswered(0);
    setCurrentStreak(0);
    setBestStreak(0);
    setAnswerTimes([]);
    setLastAnswerTime(null);
    setRecentAnswers([]);
    setIsCompleted(false);
  };

  // Compute all stats in one place to pass to components
  const computeStats = (): PracticeStats => {
    // This is a dummy reference to timeRefresh to ensure this function
    // re-runs when the timer ticks
    const _ = timeRefresh;

    const accuracy =
      totalAnswered > 0
        ? ((correctCount / totalAnswered) * 100).toFixed(1)
        : "0.0";

    const accuracyPercent = parseFloat(accuracy);

    return {
      totalCards: flashcards.length,
      remainingCards: remainingCards.length,
      correctCount,
      totalAnswered,
      currentStreak,
      bestStreak,
      accuracy,
      accuracyPercent,
      performanceLabel: getPerformanceLabel(),
      sessionDuration: isCompleted
        ? finalSessionDuration
        : getSessionDuration(),
      learningPace: isCompleted ? finalLearningPace : getLearningPace(),
      estimatedTimeToFinish: getEstimatedTimeToFinish(),
      averageResponseTime: isCompleted
        ? finalResponseTime
        : getAverageResponseTime(),
      hasResponseTimes: answerTimes.length > 0,
      trendAnalysis: getTrendAnalysis,
    };
  };

  if (isLoading) return <LoadingIndicator />;

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => id && getDeckFlashcards(id as string)}
        fullScreen
      />
    );
  }

  if (flashcards.length === 0) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <HeaderWithBackButton title="Practice" />
        <View style={styles.emptyContainer}>
          <IconButton
            icon="cards-outline"
            size={60}
            iconColor={theme.colors.outline}
          />
          <CustomText
            variant="titleMedium"
            style={{ color: theme.colors.onSurface }}
          >
            No flashcards found in this deck
          </CustomText>
          <Button
            mode="contained"
            icon="arrow-left"
            onPress={() => router.push("/dashboard/decks")}
            style={styles.button}
          >
            Back to Decks
          </Button>
        </View>
      </View>
    );
  }

  // Calculate all stats
  const stats = computeStats();

  if (isCompleted) {
    return (
      <CompletedScreen
        stats={stats}
        handleRestartPractice={handleRestartPractice}
        theme={theme}
      />
    );
  }

  const progress = correctCount / flashcards.length;

  return (
    <ScrollView
      ref={scrollViewRef}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <HeaderWithBackButton title="Practice" />

      {/* Progress indicator */}
      <Surface style={styles.progressSurface} elevation={0}>
        <View style={styles.progressHeader}>
          <View style={styles.progressLabelContainer}>
            <IconButton
              icon="check-circle"
              size={20}
              style={styles.progressIcon}
              iconColor={theme.colors.primary}
            />
            <CustomText
              variant="labelLarge"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Progress
            </CustomText>
          </View>
          <CustomText
            variant="labelLarge"
            style={{ color: theme.colors.primary }}
          >
            {correctCount} of {flashcards.length}
          </CustomText>
        </View>

        <ProgressBar
          progress={progress}
          color={theme.colors.primary}
          style={styles.progressBar}
        />
      </Surface>

      {/* Stats panel */}
      <StatsPanel
        statsTab={statsTab}
        setStatsTab={setStatsTab}
        stats={stats}
        theme={theme}
      />

      {/* Flashcard section */}
      <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
        {remainingCards.length > 0 && (
          <FlashcardView
            flashcard={remainingCards[currentIndex]}
            onAnswer={handleAnswer}
            onFlip={() => setShouldAutoScroll(true)}
          />
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressSurface: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  progressLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressIcon: {
    margin: 0,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  mainContent: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
  emptyContainer: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    marginTop: 8,
  },
});
