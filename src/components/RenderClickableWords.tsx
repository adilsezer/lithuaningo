import React from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { cleanWord } from "@utils/stringUtils";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useAppSelector } from "@src/redux/hooks";

const { width } = Dimensions.get("window");
const isTablet = (Platform.OS === "ios" && Platform.isPad) || width >= 768;

interface RenderClickableWordsProps {
  sentenceText: string;
  answerText: string;
  useClickedWordsColor: boolean;
}

const RenderClickableWords: React.FC<RenderClickableWordsProps> = ({
  sentenceText,
  answerText,
  useClickedWordsColor,
}) => {
  const router = useRouter();
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  const handleWordClick = (word: string) => {
    router.push(`/learning/${cleanWord(word)}`);
  };
  const clickedWords = useAppSelector((state) => state.clickedWords);

  return (
    <View style={styles.sentenceContainer}>
      {sentenceText.split(" ").map((word: string, index: number) => {
        const cleanedWord = cleanWord(word);
        const isPlaceholder =
          answerText.toLowerCase() === cleanedWord.toLowerCase() ||
          cleanedWord === "[]";
        const backgroundColor =
          useClickedWordsColor &&
          clickedWords
            .map((word) => word.toLowerCase())
            .includes(cleanedWord.toLowerCase())
            ? globalColors.wordHighlightBackground
            : globalColors.wordBackground;
        const containerStyle = [
          styles.commonContainer,
          isPlaceholder && {
            borderColor: globalColors.secondary,
            borderWidth: 2,
          },
          !isPlaceholder && { backgroundColor },
        ];
        const textStyle = [
          globalStyles.text,
          isPlaceholder ? styles.placeholderText : styles.wordText,
          isTablet &&
            (isPlaceholder ? styles.placeholderTextIpad : styles.wordTextIpad),
        ];

        if (isPlaceholder) {
          return (
            <View key={`${word}-${index}`} style={containerStyle}>
              <Text style={textStyle}>{word}</Text>
            </View>
          );
        }
        return (
          <TouchableOpacity
            key={`${word}-${index}`}
            onPress={() => handleWordClick(word)}
            style={containerStyle}
            activeOpacity={0.7}
          >
            <Text style={textStyle}>{word}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  sentenceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  },
  commonContainer: {
    marginHorizontal: 8, // Increase margin for better spacing between words
    marginVertical: 8, // Increase vertical margin for better touch area
    borderRadius: 10,
    paddingVertical: 8, // Increase padding for larger touch area
    paddingHorizontal: 10, // Increase padding for larger touch area
    alignItems: "center", // Center align horizontally
    justifyContent: "center", // Center align vertically
    elevation: 2, // Add shadow for better visual separation (Android)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  wordText: {
    fontSize: 20,
    textAlign: "center",
  },
  wordTextIpad: {
    fontSize: 30,
  },
  placeholderText: {
    fontSize: 20,
    textAlign: "center",
  },
  placeholderTextIpad: {
    fontSize: 30,
  },
});

export default RenderClickableWords;
