import React, { useEffect, useState } from "react";
import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useFlashcards } from "@hooks/useFlashcards";
import { FlashcardView } from "@components/flashcard/FlashcardView";
import { useUserData } from "@stores/useUserStore";
import CustomText from "@components/ui/CustomText";
import BackButton from "@components/ui/BackButton";
import { useUserChallengeStats } from "@src/hooks/useUserChallengeStats";
import { useTheme, ProgressBar, Button, IconButton } from "react-native-paper";
import { LoadingIndicator } from "@components/ui/LoadingIndicator";
import { ErrorMessage } from "@components/ui/ErrorMessage";

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
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => router.back()}
          />
          <CustomText variant="titleLarge" style={styles.title}>
            Practice
          </CustomText>
          <View style={{ width: 40 }} />
        </View>

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
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
        <CustomText variant="titleLarge" style={styles.title}>
          Practice
        </CustomText>
        <View style={{ width: 40 }} />
      </View>

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
    </SafeAreaView>
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
  title: {
    textAlign: "center",
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
