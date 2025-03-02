import React, { useEffect, useState } from "react";
import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useFlashcards } from "@hooks/useFlashcards";
import { FlashcardView } from "@components/flashcard/FlashcardView";
import { useUserData } from "@stores/useUserStore";
import CustomText from "@components/ui/CustomText";
import { useUserChallengeStats } from "@src/hooks/useUserChallengeStats";
import { useTheme, ProgressBar, Button, IconButton } from "react-native-paper";
import { LoadingIndicator } from "@components/ui/LoadingIndicator";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import HeaderWithBackButton from "@components/layout/HeaderWithBackButton";

export default function PracticeScreen() {
  const { id } = useLocalSearchParams();
  const { getDeckFlashcards, flashcards, error, isLoading } = useFlashcards();
  const theme = useTheme();
  const userData = useUserData();
  const { stats, fetchStats, updateStats } = useUserChallengeStats(
    userData?.id
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (id) {
      getDeckFlashcards(id as string);
    }
    if (userData?.id) {
      fetchStats();
    }
  }, [id, userData?.id]);

  const handleAnswer = async (isCorrect: boolean) => {
    if (!userData?.id || !stats) return;

    try {
      await updateStats({
        todayCorrectAnswers: stats.todayCorrectAnswers + (isCorrect ? 1 : 0),
        todayIncorrectAnswers:
          stats.todayIncorrectAnswers + (isCorrect ? 0 : 1),
      });

      // Move to next card
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    } catch (error) {
      console.error("Error updating challenge stats:", error);
    }
  };

  if (isLoading || stats === null) {
    return <LoadingIndicator />;
  }

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
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <HeaderWithBackButton title="Practice" />
        <View style={styles.emptyContainer}>
          <CustomText
            variant="titleMedium"
            style={{ color: theme.colors.onSurface }}
          >
            No flashcards found in this deck
          </CustomText>
          <Button
            mode="contained"
            onPress={() => router.push("/dashboard/decks")}
            style={styles.backButton}
          >
            Back to Decks
          </Button>
        </View>
      </ScrollView>
    );
  }

  const progress = (currentIndex + 1) / flashcards.length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <HeaderWithBackButton title="Practice" />
      <ProgressBar
        progress={progress}
        color={theme.colors.primary}
        style={styles.progressBar}
      />

      <CustomText
        variant="bodyMedium"
        style={[styles.progress, { color: theme.colors.onSurfaceVariant }]}
      >
        Card {currentIndex + 1} of {flashcards.length}
      </CustomText>

      <View style={styles.mainContent}>
        <FlashcardView
          flashcard={flashcards[currentIndex]}
          onAnswer={handleAnswer}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 0,
  },
  progress: {
    textAlign: "center",
    marginVertical: 8,
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    marginTop: 24,
  },
});
