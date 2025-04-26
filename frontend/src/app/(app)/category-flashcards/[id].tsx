import React, { useCallback, useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTheme, Button } from "react-native-paper";
import { useLocalSearchParams, router } from "expo-router";
import {
  useFlashcardStore,
  DAILY_FLASHCARD_LIMIT,
  FlashcardMessage,
} from "@stores/useFlashcardStore";
import { useUserData, useIsPremium } from "@stores/useUserStore";
import CustomText from "@components/ui/CustomText";
import Flashcard from "@components/ui/Flashcard";
import FlashcardStats from "@components/ui/FlashcardStats";
import LoadingIndicator from "@components/ui/LoadingIndicator";

export default function CategoryFlashcardsScreen() {
  const theme = useTheme();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const userData = useUserData();
  const isPremium = useIsPremium();

  // Get everything we need from the store
  const {
    // Data
    flashcards,
    currentIndex,
    flipped,
    currentFlashcardStats,
    isDeckCompleted,
    submissionMessage,
    error,

    // Loading states
    isLoading,
    isLoadingStats,
    isLoadingFlashcards,

    // Daily limit data
    flashcardsAnsweredToday,
    isDailyLimitReached,
    canFetchNewCards,

    // Actions
    syncFlashcardCount,
    fetchFlashcards,
    handleFlip,
    submitFlashcardAnswer,
    resetSession,
  } = useFlashcardStore();

  // Compute the current flashcard from the store data
  const currentFlashcard = flashcards[currentIndex];
  const totalCards = flashcards.length;
  const dailyLimitReached = isDailyLimitReached(isPremium);

  // Memoize navigation handlers
  const handleGoBack = useCallback(() => {
    resetSession();
    router.back();
  }, [resetSession]);

  const handleGoToLogin = useCallback(() => router.push("/auth/login"), []);
  const handleGoToPremium = useCallback(() => router.push("/premium"), []);

  // Initialize when screen loads
  useEffect(() => {
    // Sync flashcard count
    if (userData?.id) {
      // First sync flashcard count
      syncFlashcardCount(userData.id).then(() => {
        // Only fetch flashcards if limit not reached
        if (!(!isPremium && isDailyLimitReached(isPremium))) {
          fetchFlashcards({
            categoryId: id,
            userId: userData.id,
            isPremium,
          });
        }
      });
    }

    // Clean up when leaving the screen
    return () => {
      resetSession();
    };
  }, [
    id,
    userData?.id,
    isPremium,
    syncFlashcardCount,
    fetchFlashcards,
    resetSession,
    isDailyLimitReached,
  ]);

  // Memoize answer submission handlers
  const handleMarkIncorrect = useCallback(() => {
    if (currentFlashcard) {
      submitFlashcardAnswer({
        flashcardId: currentFlashcard.id,
        wasCorrect: false,
        userId: userData?.id,
      });
    }
  }, [currentFlashcard, submitFlashcardAnswer, userData?.id]);

  const handleMarkCorrect = useCallback(() => {
    if (currentFlashcard) {
      submitFlashcardAnswer({
        flashcardId: currentFlashcard.id,
        wasCorrect: true,
        userId: userData?.id,
      });
    }
  }, [currentFlashcard, submitFlashcardAnswer, userData?.id]);

  // Handler for fetching a new batch of cards
  const handleFetchNewCards = useCallback(() => {
    if (userData?.id) {
      fetchFlashcards({
        categoryId: id,
        userId: userData.id,
        isPremium,
      });
    }
  }, [id, userData?.id, isPremium, fetchFlashcards]);

  // Function to get message background color based on message type
  const getMessageBackgroundColor = useCallback(
    (messageType: FlashcardMessage["type"]) => {
      switch (messageType) {
        case "success":
          return theme.colors.primary;
        case "error":
          return theme.colors.error;
        case "info":
        default:
          return theme.colors.background;
      }
    },
    [theme.colors]
  );

  // Show loader while checking user stats
  if (isLoading || isLoadingStats) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LoadingIndicator modal={false} />
        <CustomText style={{ marginTop: 16 }}>
          Loading your progress...
        </CustomText>
      </View>
    );
  }

  if (!userData?.id) {
    return (
      <View style={[styles.container, styles.centered]}>
        <CustomText variant="titleLarge" style={{ marginBottom: 16 }}>
          User Login Required
        </CustomText>
        <CustomText style={{ textAlign: "center", marginBottom: 24 }}>
          Please log in to track your flashcard progress.
        </CustomText>
        <Button mode="contained" onPress={handleGoToLogin}>
          Go to Login
        </Button>
      </View>
    );
  }

  // Show premium upgrade message if daily limit is reached
  if (!isPremium && dailyLimitReached) {
    return (
      <View style={[styles.container, styles.centered]}>
        <CustomText variant="headlineSmall" style={styles.completedText}>
          Daily Limit Reached! 🔒
        </CustomText>
        <CustomText variant="bodyLarge" style={styles.completedSubtext}>
          You've answered {DAILY_FLASHCARD_LIMIT} flashcards today, which is the
          daily limit for free users.
        </CustomText>
        <CustomText variant="bodyMedium" style={styles.premiumMessage}>
          Upgrade to Premium to access unlimited flashcards and accelerate your
          learning!
        </CustomText>
        <View style={styles.completedButtonsContainer}>
          <Button
            mode="contained"
            onPress={handleGoToPremium}
            style={styles.completedButton}
            icon="star"
          >
            Upgrade to Premium
          </Button>
          <Button
            mode="outlined"
            onPress={handleGoBack}
            style={styles.completedButton}
          >
            Return to Categories
          </Button>
        </View>
      </View>
    );
  }

  if (isLoadingFlashcards && totalCards === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LoadingIndicator modal={false} />
        <CustomText style={{ marginTop: 16 }}>
          🤖 Thinking hard... AI is generating your flashcards!
        </CustomText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <CustomText variant="bodyLarge" style={styles.errorText}>
          {error}
        </CustomText>
        <Button mode="contained" onPress={handleFetchNewCards}>
          Retry
        </Button>
      </View>
    );
  }

  if (totalCards === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <CustomText variant="bodyLarge">
          No flashcards found for this category.
        </CustomText>
        <Button mode="contained" onPress={handleGoBack}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <CustomText variant="titleLarge" bold>
          {name} Flashcards
        </CustomText>
        {!isDeckCompleted && (
          <CustomText variant="bodyMedium">
            Card {currentIndex + 1} of {totalCards}
          </CustomText>
        )}
        {!isPremium && (
          <CustomText variant="bodySmall" style={styles.limitInfo}>
            {flashcardsAnsweredToday}/{DAILY_FLASHCARD_LIMIT} daily flashcards
            used
          </CustomText>
        )}
      </View>

      {submissionMessage && (
        <View
          style={[
            styles.messageContainer,
            {
              backgroundColor: getMessageBackgroundColor(
                submissionMessage.type
              ),
            },
          ]}
        >
          <CustomText
            variant="bodyLarge"
            style={{ textAlign: "center", color: theme.colors.onPrimary }}
          >
            {submissionMessage.text}
          </CustomText>
        </View>
      )}

      {isDeckCompleted ? (
        // Completed deck view
        <View style={styles.completedContainer}>
          <CustomText variant="headlineSmall" style={styles.completedText}>
            Congratulations! 🎉
          </CustomText>

          {isPremium ? (
            <>
              <CustomText variant="bodyLarge" style={styles.completedSubtext}>
                You've completed all flashcards in this deck.
              </CustomText>
              <View style={styles.completedButtonsContainer}>
                <Button
                  mode="contained"
                  onPress={handleFetchNewCards}
                  style={styles.completedButton}
                  icon="refresh"
                  loading={isLoadingFlashcards}
                  disabled={isLoadingFlashcards}
                >
                  Get New Cards
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleGoBack}
                  style={styles.completedButton}
                >
                  Return to Categories
                </Button>
              </View>
            </>
          ) : (
            <>
              <CustomText variant="bodyLarge" style={styles.completedSubtext}>
                You've completed all free flashcards in this deck.
              </CustomText>
              {dailyLimitReached ? (
                <CustomText variant="bodyMedium" style={styles.premiumMessage}>
                  You've reached your daily limit of {DAILY_FLASHCARD_LIMIT}{" "}
                  flashcards. Upgrade to Premium for unlimited access!
                </CustomText>
              ) : (
                <CustomText variant="bodyMedium" style={styles.premiumMessage}>
                  Upgrade to Premium to access unlimited flashcards and
                  accelerate your learning!
                </CustomText>
              )}
              <View style={styles.completedButtonsContainer}>
                <Button
                  mode="contained"
                  onPress={handleGoToPremium}
                  style={styles.completedButton}
                  icon="star"
                >
                  Upgrade to Premium
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleGoBack}
                  style={styles.completedButton}
                >
                  Return to Categories
                </Button>
              </View>
            </>
          )}
        </View>
      ) : (
        // Active flashcard view
        currentFlashcard && (
          <>
            <Flashcard
              flashcard={currentFlashcard}
              flipped={flipped}
              onPress={handleFlip}
            />

            {flipped && (
              <View style={styles.answerButtonsContainer}>
                <Button
                  mode="contained"
                  buttonColor={theme.colors.error}
                  style={styles.answerButton}
                  onPress={handleMarkIncorrect}
                  icon="close"
                  disabled={!canFetchNewCards(isPremium)}
                >
                  Incorrect
                </Button>
                <Button
                  mode="contained"
                  buttonColor={theme.colors.primary}
                  style={styles.answerButton}
                  onPress={handleMarkCorrect}
                  icon="check"
                  disabled={!canFetchNewCards(isPremium)}
                >
                  Correct
                </Button>
              </View>
            )}

            <FlashcardStats
              stats={currentFlashcardStats}
              isLoading={isLoadingFlashcards}
            />
          </>
        )
      )}

      <CustomText variant="bodySmall" style={styles.disclaimer}>
        Note: These flashcards are generated by AI and may contain inaccuracies.
        They are regularly reviewed, and a verified sign will appear if approved
        by our team.
      </CustomText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  errorText: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
  disclaimer: {
    marginTop: 20,
    textAlign: "center",
  },
  messageContainer: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  answerButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
    marginBottom: 20,
  },
  answerButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  completedContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 12,
  },
  completedText: {
    marginBottom: 12,
    textAlign: "center",
  },
  completedSubtext: {
    textAlign: "center",
    marginBottom: 24,
  },
  completedButtonsContainer: {
    width: "100%",
    marginTop: 16,
    gap: 12,
  },
  completedButton: {
    marginBottom: 8,
  },
  premiumMessage: {
    textAlign: "center",
    marginBottom: 16,
    fontStyle: "italic",
  },
  limitInfo: {
    marginTop: 4,
    color: "gray",
  },
});
