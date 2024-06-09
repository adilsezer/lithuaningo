import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { LearningCard } from "../services/FirebaseDataService";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import CustomButton from "./CustomButton";
import useStats from "@src/hooks/useStats";
import { useCardLogic } from "@src/hooks/useCardLogic";

interface MultipleChoiceCardProps {
  card: LearningCard;
  onOptionSelect: () => void;
}

const MultipleChoiceCard: React.FC<MultipleChoiceCardProps> = ({
  card,
  onOptionSelect,
}) => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const { handleAnswer } = useStats();
  const { selectedOption, isCorrect, handlePress } = useCardLogic(
    card.answer,
    card.answer
  ); // Pass the baseForm as card.answer or an empty string

  if (!card.options) {
    return null;
  }

  const handleOptionPress = (option: string) => {
    const correct = handlePress(option);
    if (correct !== null) {
      const timeSpent = 0.5; // Example value for time spent on the question
      handleAnswer(correct, timeSpent);
      onOptionSelect(); // Trigger the callback to show the Continue button
    }
  };

  const getOptionBackgroundColor = (option: string) => {
    if (!selectedOption) {
      return globalColors.inactive;
    }
    if (selectedOption === option) {
      return option === card.answer ? globalColors.active : globalColors.error;
    }
    if (option === card.answer) {
      return globalColors.active;
    }
    return globalColors.inactive;
  };

  return (
    <View>
      <Text style={globalStyles.title}>{card.question}</Text>

      {card.image && (
        <Image source={{ uri: card.image }} style={styles.image} />
      )}
      {isCorrect !== null && (
        <Text
          style={[
            styles.feedbackText,
            { color: isCorrect ? globalColors.active : globalColors.error },
          ]}
        >
          {isCorrect ? "Correct" : `Correct Answer: ${card.answer}`}
        </Text>
      )}
      {card.options.map((option: string, index: number) => (
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
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 200,
    height: 200,
    marginBottom: 10,
    alignSelf: "center",
    borderRadius: 10,
  },
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

export default MultipleChoiceCard;
