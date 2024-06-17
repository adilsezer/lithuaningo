// src/components/MultipleChoiceQuiz.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import CustomButton from "./CustomButton";

interface MultipleChoiceQuizProps {
  question: string;
  options: string[];
  correctAnswer: string;
  onAnswer: (isCorrect: boolean) => void;
}

const MultipleChoiceQuiz: React.FC<MultipleChoiceQuizProps> = ({
  question,
  options,
  correctAnswer,
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
  }, [question]);

  const handleOptionPress = (option: string) => {
    if (!optionSelected) {
      const correct = option === correctAnswer;
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
      return option === correctAnswer
        ? globalColors.active
        : globalColors.error;
    }
    if (option === correctAnswer) {
      return globalColors.active;
    }
    return globalColors.inactive;
  };

  return (
    <View>
      <Text style={globalStyles.title}>{question}</Text>
      {options.map((option, index) => (
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
      {isCorrect !== null && (
        <Text
          style={[
            styles.feedbackText,
            { color: isCorrect ? globalColors.active : globalColors.error },
          ]}
        >
          {isCorrect ? "Correct" : `Correct Answer: ${correctAnswer}`}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  optionContainer: {
    marginVertical: 5,
  },
  feedbackText: {
    marginTop: 5,
    fontSize: 16,
    alignSelf: "center",
    fontWeight: "bold",
  },
});

export default MultipleChoiceQuiz;
