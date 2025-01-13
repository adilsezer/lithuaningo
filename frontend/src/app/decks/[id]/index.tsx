import React, { useEffect } from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useFlashcards } from "@hooks/useFlashcards";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { SectionTitle } from "@components/typography";
import { FlashcardView } from "@components/flashcard/FlashcardView";
import { PracticeStats } from "@components/flashcard/PracticeStats";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import BackButton from "@components/layout/BackButton";
import { usePracticeStats } from "@hooks/usePracticeStats";

export default function PracticeScreen() {
  const { id } = useLocalSearchParams();
  const { fetchDeckFlashcards, flashcards, isLoading, error } = useFlashcards();
  const { colors } = useThemeStyles();
  const userData = useAppSelector(selectUserData);
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
        <Text style={[styles.emptyText, { color: colors.text }]}>
          No flashcards found in this deck
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BackButton />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle>Practice</SectionTitle>
        {userData && (
          <PracticeStats deckId={id as string} userId={userData.id} />
        )}
        <Text style={[styles.progress, { color: colors.text }]}>
          {currentIndex + 1} / {flashcards.length}
        </Text>
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
