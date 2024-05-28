// components/TrueFalseCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LearningCard } from "../services/FirebaseDataService";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import CustomButton from "./CustomButton";
import useStats from "@src/hooks/useStats";
import { useCardLogic } from "@src/hooks/useCardLogic";

interface TrueFalseCardProps {
  card: LearningCard;
}

const TrueFalseCard: React.FC<TrueFalseCardProps> = ({ card }) => {
  const { handleAnswer } = useStats();
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const { selectedOption, isCorrect, handlePress } = useCardLogic(card.correctAnswer);

  const handleOptionPress = (option: string) => {
    const correct = handlePress(option);
    if (correct !== null) {
      const timeSpent = 1; // Example value for time spent on the question
      handleAnswer(correct, timeSpent);
    }
  };

  const getOptionBackgroundColor = (option: string) => {
    if (!selectedOption) {
      return globalColors.inactive;
    }
    if (selectedOption === option) {
      return isCorrect ? globalColors.active : globalColors.error;
    }
    if ((option === "True" && card.correctAnswer === "true") || (option === "False" && card.correctAnswer === "false")) {
      return globalColors.active;
    }
    return globalColors.inactive;
  };

  return (
    <View>
      <Text style={globalStyles.title}>{card.question}</Text>
      {isCorrect !== null && (
        <Text
          style={[
            styles.feedbackText,
            { color: isCorrect ? globalColors.active : globalColors.error }
          ]}
        >
          {isCorrect ? "Correct" : `Correct Answer: ${card.correctAnswer}`}
        </Text>
      )}
      <View style={styles.optionContainer}>
        <CustomButton
          title="True"
          onPress={() => handleOptionPress("True")}
          style={[
            globalStyles.button,
            {
              paddingVertical: 14,
              marginVertical: 6,
              backgroundColor: getOptionBackgroundColor("True"),
            },
          ]}
        />
        <CustomButton
          title="False"
          onPress={() => handleOptionPress("False")}
          style={[
            globalStyles.button,
            {
              paddingVertical: 14,
              marginVertical: 6,
              backgroundColor: getOptionBackgroundColor("False"),
            },
          ]}
        />
      </View>
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
  },
});

export default TrueFalseCard;
