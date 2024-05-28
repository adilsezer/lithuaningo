// components/FillInTheBlankCard.tsx
import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { LearningCard } from "../services/FirebaseDataService";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import useStats from "@src/hooks/useStats";
import CustomButton from "./CustomButton";
import { useCardLogic } from "@src/hooks/useCardLogic";

interface FillInTheBlankCardProps {
  card: LearningCard;
}

const FillInTheBlankCard: React.FC<FillInTheBlankCardProps> = ({ card }) => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const { handleAnswer } = useStats();
  const { selectedOption, isCorrect, handleSubmit } = useCardLogic(card.correctAnswer);

  const handleFormSubmit = () => {
    const correct = handleSubmit(selectedOption || "");
    const timeSpent = 1; // Example value for time spent on the question
    handleAnswer(correct, timeSpent);
  };

  const getQuestionText = () => {
    if (isCorrect !== null) {
      return card.question.replace(card.correctAnswer, card.correctAnswer);
    }
    return card.question.replace(card.correctAnswer, '[...]');
  };

  return (
    <View>
      <Text style={globalStyles.title}>{getQuestionText()}</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="Type your answer here"
        placeholderTextColor={globalColors.placeholder}
        value={selectedOption || ""}
        onChangeText={(text) => handleSubmit(text)}
        editable={isCorrect === null} // Disable input after submission
      />
      {isCorrect !== null && (
        <Text style={[styles.feedbackText, { color: isCorrect ? globalColors.active : globalColors.error }]}>
          {isCorrect ? "Correct" : `Incorrect. Correct Answer: ${card.correctAnswer}`}
        </Text>
      )}
      <CustomButton title="Submit" onPress={handleFormSubmit} disabled={isCorrect !== null} />
    </View>
  );
};

const styles = StyleSheet.create({
  feedbackText: {
    marginTop: 5,
    fontSize: 16,
    alignSelf: "center",
  },
});

export default FillInTheBlankCard;
