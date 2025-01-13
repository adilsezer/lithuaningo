import React from "react";
import FlashcardScreen from "@components/learning/Flashcard";
import { useLocalSearchParams } from "expo-router";
import { useWordDetails } from "@hooks/useWordDetails";
import { ErrorMessage } from "@components/ui/ErrorMessage";

const Flashcard = () => {
  const { wordId } = useLocalSearchParams<{ wordId: string }>();
  const { error, isValidWordId, clearError } = useWordDetails(wordId);

  if (!isValidWordId) {
    return <ErrorMessage message="Error: wordId is missing" fullScreen />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => {
          clearError();
          if (wordId) {
            // The hook will automatically reload the word
          }
        }}
        fullScreen
      />
    );
  }

  return <FlashcardScreen wordId={wordId} />;
};

export default Flashcard;
