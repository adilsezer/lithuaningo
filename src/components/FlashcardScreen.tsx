// components/FlashcardScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Image, Button } from "react-native";
import { useRouter } from "expo-router";
import wordService, { Word } from "../services/data/wordService";

interface FlashcardScreenProps {
  wordId: string;
}

const FlashcardScreen: React.FC<FlashcardScreenProps> = ({ wordId }) => {
  const [word, setWord] = useState<Word | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadWord = async () => {
      try {
        console.log("Fetching word data for wordId:", wordId); // Add logging to check wordId
        const fetchedWords = await wordService.fetchWords();
        console.log("Fetched words:", fetchedWords); // Add logging to check fetched words

        // Find the word by checking the base form and all grammatical forms
        const selectedWord = fetchedWords.find(
          (w) =>
            w.id.toLowerCase() === wordId.toLowerCase() ||
            w.grammatical_forms.some(
              (form) => form.toLowerCase() === wordId.toLowerCase()
            )
        );

        console.log("Selected word:", selectedWord); // Add logging to check selected word
        setWord(selectedWord || null);
      } catch (error) {
        console.error("Error loading word:", error);
      }
    };

    loadWord();
  }, [wordId]);

  return (
    <View>
      {word ? (
        <>
          <Text>{word.id}</Text>
          <Text>{word.english_translation}</Text>
          <Image
            source={{ uri: word.image_url }}
            style={{ width: 100, height: 100 }}
          />
          <Text>{word.additional_info}</Text>
        </>
      ) : (
        <Text>Word not found</Text>
      )}
      <Button title="Back to Learning" onPress={() => router.back()} />
    </View>
  );
};

export default FlashcardScreen;
