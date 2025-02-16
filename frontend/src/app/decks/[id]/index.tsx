import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useFlashcards } from "@hooks/useFlashcards";
import { FlashcardView } from "@components/flashcard/FlashcardView";
import { UserChallengeStatsView } from "@components/challenge/UserChallengeStats";
import { useUserData } from "@stores/useUserStore";
import CustomText from "@components/ui/CustomText";
import BackButton from "@components/layout/BackButton";
import { useUserChallengeStats } from "@src/hooks/useUserChallengeStats";
import { useTheme } from "react-native-paper";
import { LoadingIndicator } from "@components/ui/LoadingIndicator";
import { ErrorMessage } from "@components/ui/ErrorMessage";

export default function PracticeScreen() {
  const { id } = useLocalSearchParams();
  const { getDeckFlashcards, flashcards, error } = useFlashcards();
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
    } catch (error) {
      console.error("Error updating challenge stats:", error);
    }
  };

  if (stats === null) {
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
      <View>
        <BackButton />
        <CustomText
          style={[styles.emptyText, { color: theme.colors.onSurface }]}
        >
          No flashcards found in this deck
        </CustomText>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <BackButton />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CustomText variant="titleLarge" bold>
          Practice
        </CustomText>
        {stats && (
          <UserChallengeStatsView deckId={id as string} userId={userData?.id} />
        )}
        <CustomText
          style={[styles.progress, { color: theme.colors.onSurface }]}
        >
          {currentIndex + 1} / {flashcards.length}
        </CustomText>
        <View style={styles.flashcardContainer}>
          <FlashcardView
            flashcard={flashcards[currentIndex]}
            onAnswer={handleAnswer}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  flashcardContainer: {
    flex: 1,
    minHeight: 500,
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
