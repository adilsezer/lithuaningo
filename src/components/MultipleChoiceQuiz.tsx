import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import CustomButton from "./CustomButton";
import ExpandableDetails from "./ExpandableDetails";

interface MultipleChoiceQuizProps {
  question: string;
  quizText: string;
  translation: string;
  image: string;
  options: string[];
  correctAnswer: string;
  onAnswer: (isCorrect: boolean) => void;
}

const MultipleChoiceQuiz: React.FC<MultipleChoiceQuizProps> = ({
  question,
  quizText,
  options,
  correctAnswer,
  translation,
  image,
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

  const renderBoldText = (text: string) => {
    const parts = text.split("**");
    return parts.map((part, index) => (
      <Text
        key={index}
        style={
          index % 2 === 1
            ? {
                fontFamily: "Roboto-Bold",
                fontSize: 18,
              }
            : {}
        }
      >
        {part}
      </Text>
    ));
  };

  return (
    <ScrollView>
      <Text style={globalStyles.subtitle}>{renderBoldText(quizText)}</Text>
      <Text style={globalStyles.title}>{question}</Text>
      {image && <Image source={{ uri: image }} style={styles.image} />}
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
        <View>
          <ExpandableDetails translation={translation}></ExpandableDetails>
          <Text
            style={[
              styles.feedbackText,
              { color: isCorrect ? globalColors.active : globalColors.error },
            ]}
          >
            {isCorrect ? "Correct" : `Correct Answer: ${correctAnswer}`}
          </Text>
        </View>
      )}
    </ScrollView>
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
  image: {
    width: 300,
    height: 300,
    marginBottom: 10,
    alignSelf: "center",
    borderRadius: 10,
  },
});

export default MultipleChoiceQuiz;
