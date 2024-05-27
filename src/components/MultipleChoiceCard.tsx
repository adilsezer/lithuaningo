// components/MultipleChoiceCard.tsx
import React, { useState } from "react";
import { View, Text, Image, StyleSheet, Alert } from "react-native";
import { LearningCard, updateUserStats } from "../services/FirebaseDataService";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import CustomButton from "./CustomButton";

interface MultipleChoiceCardProps {
  card: LearningCard;
  userId: string; // Pass the userId as a prop
}

const MultipleChoiceCard: React.FC<MultipleChoiceCardProps> = ({
  card,
  userId,
}) => {
  const { styles: globalStyles } = useThemeStyles();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  if (!card.options) {
    return null;
  }

  const handlePress = async (option: string) => {
    setSelectedOption(option);
    const isCorrect = option === card.correctAnswer;

    try {
      const timeSpent = 1; // Example value for time spent on the question, you can calculate this based on user interaction time
      await updateUserStats(userId, isCorrect, timeSpent);
      Alert.alert(
        "Answer Submitted",
        `You selected ${option}. Correct answer is ${card.correctAnswer}.`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update user stats.");
    }
  };

  return (
    <View>
      <Text style={globalStyles.title}>{card.question}</Text>
      {card.image && (
        <Image source={{ uri: card.image }} style={styles.image} />
      )}
      {card.options.map((option: string, index: number) => (
        <CustomButton
          key={index}
          title={option}
          onPress={() => handlePress(option)}
          style={[
            globalStyles.button,
            {
              paddingVertical: 14,
              backgroundColor:
                selectedOption === option
                  ? "#D3D3D3"
                  : globalStyles.button.backgroundColor,
            },
          ]}
        />
      ))}
      {selectedOption && (
        <Text style={globalStyles.subtitle}>
          Correct Answer: {card.correctAnswer}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 200,
    height: 200,
    marginBottom: 10,
    alignSelf: "center",
  },
});

export default MultipleChoiceCard;
