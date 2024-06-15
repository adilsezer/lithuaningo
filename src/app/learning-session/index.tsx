import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import sentenceService, { Sentence } from "../../services/data/sentenceService";
import wordService, { Word } from "../../services/data/wordService";
import BackButton from "@components/BackButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

const LearningScreen: React.FC = () => {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const router = useRouter();
  const { styles: globalStyles } = useThemeStyles();

  useEffect(() => {
    const loadSentencesAndWords = async () => {
      try {
        const [fetchedSentences, fetchedWords] = await Promise.all([
          sentenceService.fetchSentences(),
          wordService.fetchWords(),
        ]);
        setSentences(fetchedSentences);
        setWords(fetchedWords);
      } catch (error) {
        console.error("Error loading sentences and words:", error);
      }
    };

    loadSentencesAndWords();
  }, []);

  const handleWordClick = (wordId: string) => {
    setSelectedWord(wordId);
    console.log("wordId clicked:", wordId);
    router.push(`/flashcard/${wordId}`);
  };

  return (
    <View style={styles.container}>
      <BackButton />
      {sentences.slice(0, 2).map((sentence) => (
        <View key={sentence.id} style={styles.sentenceContainer}>
          {sentence.sentence.split(" ").map((word: string) => (
            <TouchableOpacity
              key={word}
              onPress={() => handleWordClick(word)}
              style={[styles.wordContainer]}
            >
              <Text style={[globalStyles.text, styles.wordText]}>{word} </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      {selectedWord && (
        <Button title="Continue" onPress={() => router.push("/quiz")} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  sentenceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
    alignSelf: "center",
  },
  wordContainer: {
    marginHorizontal: 2,
    borderRadius: 8, // Rounded edges for a modern look
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: "#f0f0f0", // Light background color for better contrast
  },
  wordText: {
    fontSize: 20, // Slightly larger font for readability
  },
});

export default LearningScreen;
