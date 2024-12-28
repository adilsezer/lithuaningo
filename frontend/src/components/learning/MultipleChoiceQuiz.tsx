import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, Dimensions, Platform } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import CustomButton from "@components/ui/CustomButton";
import RenderClickableWords from "@components/learning/RenderClickableWords";
import { SectionTitle, Subtitle, Instruction } from "@components/typography";

const { width } = Dimensions.get("window");
const isTablet = (Platform.OS === "ios" && Platform.isPad) || width >= 768;

interface MultipleChoiceQuizProps {
  sentenceText: string;
  questionText: string;
  questionWord: string;
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
  image,
  questionIndex,
  questionWord,
  onAnswer,
}) => {
  const { colors } = useThemeStyles();
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
      return colors.inactive;
    }
    if (selectedOption === option) {
      return option === correctAnswerText ? colors.active : colors.error;
    }
    if (option === correctAnswerText) {
      return colors.active;
    }
    return colors.inactive;
  };

  return (
    <View>
      <Subtitle>{questionText}</Subtitle>
      <View style={styles.sentenceContainer}>
        <RenderClickableWords
          sentenceText={sentenceText}
          answerText={questionWord}
          useClickedWordsColor={false}
        />
      </View>
      <Instruction>Click on each word to find out what it means.</Instruction>
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
                styles.button,
                {
                  backgroundColor: getOptionBackgroundColor(option),
                },
              ]}
            />
          </View>
        ))}
      {optionSelected && (
        <View>
          <Subtitle>
            You answered:{" "}
            <Subtitle style={{ fontFamily: "Roboto-Bold" }}>
              {selectedOption}
            </Subtitle>
          </Subtitle>
          <Subtitle>
            Correct answer:{" "}
            <Subtitle style={{ fontFamily: "Roboto-Bold" }}>
              {correctAnswerText}
            </Subtitle>
          </Subtitle>
        </View>
      )}
      {isCorrect !== null && (
        <View>
          <SectionTitle
            style={{
              color: isCorrect ? colors.active : colors.error,
            }}
          >
            {isCorrect ? "Correct" : "Incorrect"}
          </SectionTitle>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  optionContainer: {
    marginVertical: 5,
  },
  button: {
    paddingVertical: 14,
    marginVertical: 6,
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
