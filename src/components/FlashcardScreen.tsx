import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import wordService, { Word } from "../services/data/wordService";
import BackButton from "./BackButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useAppDispatch } from "@src/redux/hooks";
import { setLoading } from "@src/redux/slices/uiSlice";

interface FlashcardScreenProps {
  wordId: string;
}

const FlashcardScreen: React.FC<FlashcardScreenProps> = ({ wordId }) => {
  const [word, setWord] = useState<Word | null>(null);
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const dispatch = useAppDispatch();

  const { width } = Dimensions.get("window");
  const isTablet = (Platform.OS === "ios" && Platform.isPad) || width >= 768;

  useEffect(() => {
    const loadWord = async () => {
      try {
        const fetchedWords = await wordService.fetchWords();

        // Find the word by checking the base form and all grammatical forms
        const selectedWord = fetchedWords.find(
          (w) =>
            w.id.toLowerCase() === wordId.toLowerCase() ||
            w.grammaticalForms.some(
              (form) => form.toLowerCase() === wordId.toLowerCase()
            )
        );

        setWord(selectedWord || null);
      } catch (error) {
        console.error("Error loading word:", error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadWord();
  }, [wordId, dispatch]);

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
      {word.imageUrl && (
        <Image
          source={{ uri: word.imageUrl }}
          style={[styles.image, isTablet && styles.imageIpad]}
        />
      )}
      <Text style={globalStyles.title}>Word: {word.id}</Text>
      <Text style={[globalStyles.title, { color: globalColors.primary }]}>
        Translation: {word.englishTranslation}
      </Text>
      {word.additionalInfo && (
        <Text style={globalStyles.subtitle}>{word.additionalInfo}</Text>
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
  imageIpad: {
    width: 500, // Increased width for iPad
    height: 500, // Increased height for iPad
  },
});

export default FlashcardScreen;
