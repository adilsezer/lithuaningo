import React, { useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTheme, Button } from "react-native-paper";
import { useLocalSearchParams, router } from "expo-router";
import { useFlashcards } from "@src/hooks/useFlashcards";
import { useUserData } from "@stores/useUserStore";
import CustomText from "@components/ui/CustomText";
import Flashcard from "@components/ui/Flashcard";
import FlashcardStats from "@components/ui/FlashcardStats";
import LoadingIndicator from "@components/ui/LoadingIndicator";

export default function CategoryFlashcardsScreen() {
  const theme = useTheme();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const userData = useUserData();

  // Memoize navigation handlers to prevent unnecessary re-renders
  const handleGoBack = useCallback(() => router.back(), []);
  const handleGoToLogin = useCallback(() => router.push("/auth/login"), []);

  const {
    // Data
    currentFlashcard,
    currentIndex,
    flipped,
    totalCards,
    currentFlashcardStats,

    // State
    isLoadingFlashcards,
    isLoadingStats,
    error,
    submissionMessage,

    // Actions
    handleFlip,
    handleSubmitAnswer,
    fetchFlashcards,
  } = useFlashcards({
    categoryId: id,
    userId: userData?.id,
  });

  // Memoize answer submission handlers - moved to top level to avoid hook order issues
  const handleMarkIncorrect = useCallback(() => {
    if (currentFlashcard) {
      handleSubmitAnswer({
        flashcardId: currentFlashcard.id,
        wasCorrect: false,
      });
    }
  }, [currentFlashcard, handleSubmitAnswer]);

  const handleMarkCorrect = useCallback(() => {
    if (currentFlashcard) {
      handleSubmitAnswer({
        flashcardId: currentFlashcard.id,
        wasCorrect: true,
      });
    }
  }, [currentFlashcard, handleSubmitAnswer]);

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
        <Button mode="contained" onPress={fetchFlashcards}>
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
        <CustomText variant="bodyMedium">
          Card {currentIndex + 1} of {totalCards}
        </CustomText>
      </View>

      {submissionMessage && (
        <View style={styles.messageContainer}>
          <CustomText
            variant="bodyLarge"
            style={{ textAlign: "center", color: theme.colors.onSurface }}
          >
            {submissionMessage}
          </CustomText>
        </View>
      )}

      {currentFlashcard && (
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
              >
                Incorrect
              </Button>
              <Button
                mode="contained"
                buttonColor={theme.colors.primary}
                style={styles.answerButton}
                onPress={handleMarkCorrect}
                icon="check"
              >
                Correct
              </Button>
            </View>
          )}

          <FlashcardStats
            stats={currentFlashcardStats}
            isLoading={isLoadingStats}
          />
        </>
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
    backgroundColor: "rgba(0,0,0,0.05)",
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
});
