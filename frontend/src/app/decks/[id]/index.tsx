import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useDecks } from "@hooks/useDecks";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { Flashcard } from "@src/types";
import { AlertDialog } from "@components/ui/AlertDialog";
import { SectionTitle } from "@components/typography";
import { FlashcardView } from "@components/flashcard/FlashcardView";
import { PracticeStats } from "@components/flashcard/PracticeStats";
import practiceService from "@services/data/practiceService";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { LoadingIndicator } from "@components/ui/LoadingIndicator";
import { ErrorMessage } from "@components/ui/ErrorMessage";

export default function PracticeScreen() {
  const { id } = useLocalSearchParams();
  const { fetchFlashcards, flashcards, isLoading, error } = useDecks();
  const { colors } = useThemeStyles();
  const userData = useAppSelector(selectUserData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState<{ correct: number; total: number }>({
    correct: 0,
    total: 0,
  });

  useEffect(() => {
    if (id) {
      fetchFlashcards(id as string);
    }
  }, [id, fetchFlashcards]);

  const handleAnswer = async (isCorrect: boolean) => {
    if (!userData) {
      AlertDialog.error("Please login to track progress");
      return;
    }

    try {
      await practiceService.trackProgress({
        userId: userData.id,
        deckId: id as string,
        flashcardId: flashcards[currentIndex].id!,
        isCorrect,
      });

      setStats((prev) => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));

      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        const percentage = Math.round((stats.correct / stats.total) * 100);
        AlertDialog.success(
          `Practice completed! Score: ${stats.correct}/${stats.total} (${percentage}%)`
        );
        setCurrentIndex(0);
        setStats({ correct: 0, total: 0 });
      }
    } catch (err) {
      AlertDialog.error("Failed to track progress");
      console.error("Error tracking progress:", err);
    }
  };

  if (isLoading) {
    return <LoadingIndicator modal={false} style={styles.centerContainer} />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => id && fetchFlashcards(id as string)}
        fullScreen
      />
    );
  }

  if (flashcards.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.emptyText, { color: colors.text }]}>
          No flashcards found in this deck
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SectionTitle>Practice</SectionTitle>
      {userData && <PracticeStats deckId={id as string} userId={userData.id} />}
      <Text style={[styles.progress, { color: colors.text }]}>
        {currentIndex + 1} / {flashcards.length}
      </Text>
      <FlashcardView
        flashcard={flashcards[currentIndex]}
        onAnswer={handleAnswer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  progress: {
    fontSize: 14,
    textAlign: "center",
    marginVertical: 8,
  },
});
