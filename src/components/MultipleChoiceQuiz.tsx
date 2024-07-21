import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import CustomButton from "./CustomButton";
import RenderClickableWords from "@components/RenderClickableWords";

const { width } = Dimensions.get("window");
const isTablet = (Platform.OS === "ios" && Platform.isPad) || width >= 768;

interface MultipleChoiceQuizProps {
  sentenceText: string;
  questionText: string;
  questionWord: string;
  translation: string;
  image: string;
  options: string[];
  correctAnswerText: string;
  questionIndex: number;
  onAnswer: (isCorrect: boolean) => void;
}

const MultipleChoiceQuiz: React.FC<MultipleChoiceQuizProps> = ({
  sentenceText,
  questionText,
  options,
  correctAnswerText,
  translation,
  image,
  questionIndex,
  questionWord,
  onAnswer,
}) => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [optionSelected, setOptionSelected] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    setSelectedOption(null);
    setOptionSelected(false);
    setIsCorrect(null);
  }, [questionIndex]);

  const handleOptionPress = (option: string) => {
    if (!optionSelected) {
      const correct = option === correctAnswerText;
      setSelectedOption(option);
      setIsCorrect(correct);
      onAnswer(correct);
      setOptionSelected(true);
    }
  };

  const getOptionBackgroundColor = (option: string) => {
    if (!selectedOption) {
      return globalColors.inactive;
    }
    if (selectedOption === option) {
      return option === correctAnswerText
        ? globalColors.active
        : globalColors.error;
    }
    if (option === correctAnswerText) {
      return globalColors.active;
    }
    return globalColors.inactive;
  };

  const renderBoldText = (text: string) => {
    const parts = text.split("**");
    return parts.map((part, index) => (
      <Text
        key={index}
        style={index % 2 === 1 ? { fontFamily: "Roboto-Bold" } : {}}
      >
        {part}
      </Text>
    ));
  };

  return (
    <View>
      <Text style={globalStyles.subtitle}>{renderBoldText(questionText)}</Text>
      <View style={styles.sentenceContainer}>
        <RenderClickableWords
          sentenceText={sentenceText}
          answerText={questionWord}
          useClickedWordsColor={false}
        />
      </View>
      <Text style={globalStyles.instruction}>
        Click on each word to find out what it means.
      </Text>
      {image && (
        <Image
          source={{ uri: image }}
          style={[styles.image, isTablet && styles.imageTablet]}
        />
      )}
      {!optionSelected &&
        options.map((option, index) => (
          <View key={index} style={styles.optionContainer}>
            <CustomButton
              title={option}
              onPress={() => handleOptionPress(option)}
              style={[
                globalStyles.button,
                {
                  paddingVertical: 14,
                  marginVertical: 6,
                  backgroundColor: getOptionBackgroundColor(option),
                },
              ]}
            />
          </View>
        ))}
      {optionSelected && (
        <View>
          <Text style={[globalStyles.subtitle]}>
            You answered:{" "}
            <Text
              style={[globalStyles.subtitle, { fontFamily: "Roboto-Bold" }]}
            >
              {selectedOption}
            </Text>
          </Text>
          <Text style={[globalStyles.subtitle]}>
            Correct answer:{" "}
            <Text
              style={[globalStyles.subtitle, { fontFamily: "Roboto-Bold" }]}
            >
              {correctAnswerText}
            </Text>
          </Text>
        </View>
      )}
      {isCorrect !== null && (
        <View>
          <Text
            style={[
              globalStyles.title,
              { color: isCorrect ? globalColors.active : globalColors.error },
            ]}
          >
            {isCorrect ? "Correct" : "Incorrect"}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  optionContainer: {
    marginVertical: 5,
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 5,
    alignSelf: "center",
    borderRadius: 10,
  },
  imageTablet: {
    width: 500,
    height: 500,
  },
  sentenceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 10,
  },
});

export default MultipleChoiceQuiz;
