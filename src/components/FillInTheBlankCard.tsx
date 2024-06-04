import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Image } from "react-native";
import { LearningCard } from "../services/FirebaseDataService";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import useStats from "@src/hooks/useStats";
import CustomButton from "./CustomButton";
import { useCardLogic } from "@src/hooks/useCardLogic";
import ExpandableDetails from "./ExpandableDetails";

interface FillInTheBlankCardProps {
  card: LearningCard;
  onSubmit: () => void;
  isSubmitPressed: boolean;
}

const FillInTheBlankCard: React.FC<FillInTheBlankCardProps> = ({
  card,
  onSubmit,
  isSubmitPressed,
}) => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const { handleAnswer } = useStats();
  const { selectedOption, isCorrect, handleSubmit } = useCardLogic(card.answer);
  const [inputText, setInputText] = useState<string>("");

  useEffect(() => {
    setInputText("");
  }, [card]);

  const handleFormSubmit = () => {
    const correct = handleSubmit(inputText);
    const timeSpent = 0.5; // Example value for time spent on the question
    handleAnswer(correct, timeSpent);
    onSubmit(); // Trigger the callback to show the Continue button
  };

  const getQuestionText = () => {
    if (isCorrect !== null) {
      return card.question.replace(card.answer, card.answer);
    }
    return card.question.replace(card.answer, "[...]");
  };

  return (
    <View>
      <Text style={globalStyles.subtitle}>
        Fill in the blank with the correct answer
      </Text>
      <Text style={globalStyles.title}>{getQuestionText()}</Text>
      {isSubmitPressed && (
        <Text
          style={[
            globalStyles.subtitle,
            { color: globalColors.secondary, marginVertical: 0 },
          ]}
        >
          Base Form: {card.baseForm}
        </Text>
      )}
      <ExpandableDetails translation={card.translation}></ExpandableDetails>
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
          {isCorrect ? "Correct" : `Incorrect. Correct Answer: ${card.answer}`}
        </Text>
      )}
      <TextInput
        style={globalStyles.input}
        placeholder="Type your answer here"
        placeholderTextColor={globalColors.placeholder}
        value={inputText}
        onChangeText={(text) => setInputText(text)}
        editable={isCorrect === null} // Disable input after submission
      />
      {!isSubmitPressed && (
        <CustomButton
          title="Submit"
          onPress={handleFormSubmit}
          disabled={isCorrect !== null}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 300,
    height: 300,
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

export default FillInTheBlankCard;
