import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { cleanWord } from "@utils/stringUtils";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { SectionText } from "@components/typography";

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
  const { colors } = useThemeStyles();

  const handleWordClick = (word: string) => {
    router.push(`/learning/${cleanWord(word)}`);
  };

  return (
    <View style={styles.sentenceContainer}>
      {sentenceText.split(" ").map((word: string, index: number) => {
        const cleanedWord = cleanWord(word);
        const isPlaceholder =
          answerText.toLowerCase() === cleanedWord.toLowerCase() ||
          cleanedWord === "[]";
        const backgroundColor = colors.wordBackground;
        const containerStyle = [
          styles.commonContainer,
          isPlaceholder && {
            backgroundColor: colors.background,
            borderColor: colors.secondary,
            borderWidth: 2,
          },
          !isPlaceholder && { backgroundColor },
        ];
        const textStyle = [
          isPlaceholder ? styles.placeholderText : styles.wordText,
          isTablet &&
            (isPlaceholder ? styles.placeholderTextIpad : styles.wordTextIpad),
        ];

        if (isPlaceholder) {
          return (
            <View key={`${word}-${index}`} style={containerStyle}>
              <SectionText style={textStyle}>{word}</SectionText>
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
            <SectionText style={textStyle}>{word}</SectionText>
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
    marginHorizontal: 8,
    marginVertical: 8,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
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
