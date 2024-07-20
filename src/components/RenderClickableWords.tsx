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
}

const RenderClickableWords: React.FC<RenderClickableWordsProps> = ({
  sentenceText,
  answerText,
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
        const backgroundColor = clickedWords
          .map((word) => word.toLowerCase())
          .includes(cleanedWord.toLowerCase())
          ? globalColors.wordHighlightBackground
          : globalColors.wordBackground;

        if (
          answerText.toLowerCase() == cleanedWord.toLowerCase() ||
          cleanedWord === "[]"
        ) {
          return (
            <View
              key={`${word}-${index}`}
              style={[
                styles.placeholderContainer,
                {
                  backgroundColor: globalColors.secondary,
                  borderColor: globalColors.wordBackground,
                  borderWidth: 1,
                },
                isTablet && styles.placeholderContainerIpad,
              ]}
            >
              <Text
                style={[
                  globalStyles.text,
                  styles.placeholderText,
                  isTablet && styles.placeholderTextIpad,
                ]}
              >
                {word}
              </Text>
            </View>
          );
        }
        return (
          <TouchableOpacity
            key={`${word}-${index}`}
            onPress={() => handleWordClick(word)}
            style={[styles.wordContainer, { backgroundColor }]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                globalStyles.text,
                styles.wordText,
                isTablet && styles.wordTextIpad,
              ]}
            >
              {word}
            </Text>
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
  wordContainer: {
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
  placeholderContainer: {
    marginHorizontal: 8, // Increase margin for better spacing between placeholders
    marginVertical: 8, // Increase vertical margin for better touch area
    borderRadius: 10,
    paddingVertical: 8, // Increase padding for consistency with wordContainer
    paddingHorizontal: 10, // Increase padding for consistency with wordContainer
    alignItems: "center", // Center align horizontally
    justifyContent: "center", // Center align vertically
  },
  placeholderText: {
    fontSize: 20,
    textAlign: "center",
  },
  placeholderTextIpad: {
    fontSize: 30,
  },
  placeholderContainerIpad: {
    paddingVertical: 8, // Ensure padding is consistent with wordContainer
    paddingHorizontal: 10, // Ensure padding is consistent with wordContainer
  },
});

export default RenderClickableWords;
