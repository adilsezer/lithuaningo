// components/FlashcardScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import wordService, { Word } from "../services/data/wordService";
import BackButton from "./BackButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

interface FlashcardScreenProps {
  wordId: string;
}

const FlashcardScreen: React.FC<FlashcardScreenProps> = ({ wordId }) => {
  const [word, setWord] = useState<Word | null>(null);
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  useEffect(() => {
    const loadWord = async () => {
      try {
        const fetchedWords = await wordService.fetchWords();

        // Find the word by checking the base form and all grammatical forms
        const selectedWord = fetchedWords.find(
          (w) =>
            w.id.toLowerCase() === wordId.toLowerCase() ||
            w.grammatical_forms.some(
              (form) => form.toLowerCase() === wordId.toLowerCase()
            )
        );

        setWord(selectedWord || null);
      } catch (error) {
        console.error("Error loading word:", error);
      }
    };

    loadWord();
  }, [wordId]);

  if (!word) {
    return (
      <View>
        <BackButton />
        <Text style={globalStyles.subtitle}>
          We don't have this word in our database at the moment.
        </Text>
        <Text style={globalStyles.subtitle}>
          We'll try to add it as soon as possible!
        </Text>
      </View>
    );
  }

  return (
    <View>
      <BackButton />
      <Image source={{ uri: word.image_url }} style={styles.image} />
      <Text style={globalStyles.title}>Word: {word.id}</Text>
      <Text style={[globalStyles.title, { color: globalColors.primary }]}>
        Translation: {word.english_translation}
      </Text>
      {word.additional_info && (
        <Text style={globalStyles.subtitle}>{word.additional_info}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
    marginBottom: 10,
    alignSelf: "center",
    borderRadius: 10,
  },
});

export default FlashcardScreen;
