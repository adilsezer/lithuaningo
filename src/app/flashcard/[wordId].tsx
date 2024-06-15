// app/flashcard/[wordId].tsx
import React from "react";
import FlashcardScreen from "../../components/FlashcardScreen";
import { useLocalSearchParams } from "expo-router";

const Flashcard = () => {
  const { wordId } = useLocalSearchParams<{ wordId: string }>();

  console.log("wordId from useSearchParams:", wordId); // Add logging to check the parameter

  if (!wordId) {
    // Handle the case where wordId is undefined (e.g., show an error message or redirect)
    return <div>Error: wordId is missing</div>;
  }

  return <FlashcardScreen wordId={wordId} />;
};

export default Flashcard;
