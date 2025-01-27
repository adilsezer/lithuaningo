import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, Dimensions, Platform } from "react-native";
import CustomButton from "@components/ui/CustomButton";
import RenderClickableWords from "@components/learning/RenderClickableWords";
import { useTheme } from "react-native-paper";
import CustomText from "@components/typography/CustomText";

const { width } = Dimensions.get("window");
const isTablet = (Platform.OS === "ios" && Platform.isPad) || width >= 768;

interface MultipleChoiceQuestionProps {
  sentenceText: string;
  questionText: string;
  questionWord: string;
  image: string;
  options: string[];
  correctAnswerText: string;
  questionIndex: number;
  onAnswer: (isCorrect: boolean) => void;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  sentenceText,
  questionText,
  options,
  correctAnswerText,
  image,
  questionIndex,
  questionWord,
  onAnswer,
}) => {
  const theme = useTheme();
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
      return theme.colors.primaryContainer;
    }
    if (selectedOption === option) {
      return option === correctAnswerText
        ? theme.colors.primary
        : theme.colors.error;
    }
    if (option === correctAnswerText) {
      return theme.colors.primary;
    }
    return theme.colors.primaryContainer;
  };

  return (
    <View>
      <CustomText>{questionText}</CustomText>
      <View style={styles.sentenceContainer}>
        <RenderClickableWords
          sentenceText={sentenceText}
          answerText={questionWord}
        />
      </View>
      <CustomText>Click on each word to find out what it means.</CustomText>
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
            />
          </View>
        ))}
      {optionSelected && (
        <View>
          <CustomText>
            You answered: <CustomText>{selectedOption}</CustomText>
          </CustomText>
          <CustomText>
            Correct answer: <CustomText>{correctAnswerText}</CustomText>
          </CustomText>
        </View>
      )}
      {isCorrect !== null && (
        <View>
          <CustomText
            style={{
              color: isCorrect ? theme.colors.primary : theme.colors.error,
            }}
          >
            {isCorrect ? "Correct" : "Incorrect"}
          </CustomText>
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

export default MultipleChoiceQuestion;
