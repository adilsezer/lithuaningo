// src/components/FillInTheBlankQuiz.tsx
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Image } from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import CustomButton from "./CustomButton";

interface FillInTheBlankQuizProps {
  question: string;
  correctAnswer: string;
  onAnswer: (isCorrect: boolean) => void;
}

const FillInTheBlankQuiz: React.FC<FillInTheBlankQuizProps> = ({
  question,
  correctAnswer,
  onAnswer,
}) => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const [inputText, setInputText] = useState<string>("");
  const [isSubmitPressed, setIsSubmitPressed] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    setInputText("");
    setIsSubmitPressed(false);
    setIsCorrect(null);
  }, [question]);

  const handleFormSubmit = () => {
    const correct = inputText.trim() === correctAnswer;
    setIsCorrect(correct);
    onAnswer(correct);
    setIsSubmitPressed(true);
  };

  return (
    <View>
      {!isSubmitPressed && (
        <Text style={globalStyles.subtitle}>
          Fill in the blank with the correct answer
        </Text>
      )}
      <Text style={globalStyles.title}>{question}</Text>
      {isCorrect !== null && (
        <Text
          style={[
            styles.feedbackText,
            { color: isCorrect ? globalColors.active : globalColors.error },
          ]}
        >
          {isCorrect
            ? "Correct"
            : `Incorrect. Correct Answer: ${correctAnswer}`}
        </Text>
      )}
      {!isSubmitPressed && (
        <View>
          <TextInput
            style={globalStyles.input}
            placeholder="Type your answer here"
            placeholderTextColor={globalColors.placeholder}
            value={inputText}
            onChangeText={(text) => setInputText(text)}
            editable={isCorrect === null} // Disable input after submission
          />
          <CustomButton
            title="Submit"
            onPress={handleFormSubmit}
            disabled={isCorrect !== null}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  feedbackText: {
    marginTop: 5,
    fontSize: 16,
    alignSelf: "center",
    fontWeight: "bold",
  },
});

export default FillInTheBlankQuiz;
