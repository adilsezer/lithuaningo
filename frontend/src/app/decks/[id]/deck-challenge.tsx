import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Surface, useTheme } from "react-native-paper";
import HeaderWithBackButton from "@components/layout/HeaderWithBackButton";
import CustomText from "@components/ui/CustomText";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import { useChallenge } from "@src/hooks/useChallenge";
import ChallengeComponent from "@components/challenge/ChallengeComponent";
import deckService from "@src/services/data/deckService";
import { Deck } from "@src/types";

export default function DeckChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [deckDetails, setDeckDetails] = useState<Deck | null>(null);
  const [loadingDeck, setLoadingDeck] = useState(true);
  const theme = useTheme();

  const {
    questions,
    currentIndex,
    currentQuestion,
    loading,
    error,
    score,
    isCorrectAnswer,
    isCompleted,
    fetchDeckChallenge,
    handleAnswer,
    handleNextQuestion,
    resetChallenge,
    getCompletionMessage,
  } = useChallenge({ skipInitialFetch: true });

  useEffect(() => {
    if (!id) return;

    const loadDeck = async () => {
      try {
        setLoadingDeck(true);
        const deck = await deckService.getDeck(id);
        setDeckDetails(deck);

        // Load deck challenge questions
        await fetchDeckChallenge(id);
      } catch (error) {
        console.error("Error loading deck:", error);
      } finally {
        setLoadingDeck(false);
      }
    };

    loadDeck();
  }, [id, fetchDeckChallenge]);

  if (loadingDeck) {
    return (
      <View style={styles.loadingContainer}>
        <HeaderWithBackButton title="Deck Challenge" />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <CustomText style={styles.loadingText}>
          Loading deck challenge...
        </CustomText>
      </View>
    );
  }

  if (!deckDetails) {
    return (
      <View style={styles.container}>
        <HeaderWithBackButton title="Deck Challenge" />
        <ErrorMessage message="Deck not found" />
      </View>
    );
  }

  const screenTitle = `${deckDetails.title} Challenge`;

  return (
    <View style={styles.container}>
      <HeaderWithBackButton title={screenTitle} />

      {error ? (
        <ErrorMessage message={error} />
      ) : (
        <ChallengeComponent
          questions={questions}
          currentIndex={currentIndex}
          currentQuestion={currentQuestion}
          loading={loading}
          error={error}
          score={score}
          isCorrectAnswer={isCorrectAnswer}
          isCompleted={isCompleted}
          title={screenTitle}
          onAnswer={handleAnswer}
          onNextQuestion={handleNextQuestion}
          onRetry={() => fetchDeckChallenge(id)}
          getCompletionMessage={getCompletionMessage}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    textAlign: "center",
  },
});
