import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import CustomButton from "./CustomButton";
import ExpandableDetails from "./ExpandableDetails";

interface MultipleChoiceQuizProps {
  sentenceText: string;
  questionText: string;
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
    <View>
      <Text style={globalStyles.subtitle}>{renderBoldText(questionText)}</Text>
      <Text style={globalStyles.title}>{sentenceText}</Text>
      <ExpandableDetails translation={translation}></ExpandableDetails>
      {image && <Image source={{ uri: image }} style={styles.image} />}
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
          <Text style={[globalStyles.text, styles.selectedOptionText]}>
            You answered:{" "}
            <Text style={{ fontFamily: "Roboto-Bold" }}>{selectedOption}</Text>
          </Text>
          <Text style={[globalStyles.text, styles.correctAnswerText]}>
            Correct answer:{" "}
            <Text style={{ fontFamily: "Roboto-Bold" }}>
              {correctAnswerText}
            </Text>
          </Text>
        </View>
      )}
      {isCorrect !== null && (
        <View>
          <Text
            style={[
              styles.feedbackText,
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
  feedbackText: {
    marginTop: 5,
    fontSize: 16,
    alignSelf: "center",
    fontWeight: "bold",
  },
  selectedOptionText: {
    marginTop: 10,
    fontSize: 16,
    alignSelf: "center",
  },
  correctAnswerText: {
    marginTop: 5,
    fontSize: 16,
    alignSelf: "center",
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 10,
    alignSelf: "center",
    borderRadius: 10,
  },
});

export default MultipleChoiceQuiz;
