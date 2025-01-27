import React, { useEffect } from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useFlashcards } from "@hooks/useFlashcards";
import { FlashcardView } from "@components/flashcard/FlashcardView";
import { PracticeStats } from "@components/flashcard/PracticeStats";
import { useUserData } from "@stores/useUserStore";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import BackButton from "@components/layout/BackButton";
import { usePracticeStats } from "@hooks/usePracticeStats";
import { useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";

export default function PracticeScreen() {
  const { id } = useLocalSearchParams();
  const { fetchDeckFlashcards, flashcards, isLoading, error } = useFlashcards();
  const theme = useTheme();
  const userData = useUserData();
  const { currentIndex, setCurrentIndex, handleAnswer, completeSession } =
    usePracticeStats(id as string, userData?.id);

  useEffect(() => {
    if (id) {
      fetchDeckFlashcards(id as string);
    }
  }, [id, fetchDeckFlashcards]);

  const onAnswer = async (isCorrect: boolean) => {
    const success = await handleAnswer(flashcards[currentIndex].id!, isCorrect);
    if (success) {
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        completeSession();
      }
    }
  };

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => id && fetchDeckFlashcards(id as string)}
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
        <CustomText>Practice</CustomText>
        {userData && (
          <PracticeStats deckId={id as string} userId={userData.id} />
        )}
        <CustomText
          style={[styles.progress, { color: theme.colors.onSurface }]}
        >
          {currentIndex + 1} / {flashcards.length}
        </CustomText>
        <View style={styles.flashcardContainer}>
          <FlashcardView
            flashcard={flashcards[currentIndex]}
            onAnswer={onAnswer}
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
