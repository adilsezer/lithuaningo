import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { LearningCard } from "../services/FirebaseDataService";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

interface FillInTheBlankCardProps {
  card: LearningCard;
}

const FillInTheBlankCard: React.FC<FillInTheBlankCardProps> = ({ card }) => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const [answer, setAnswer] = useState<string>("");

  return (
    <View style={styles.container}>
      <Text style={[globalStyles.title, styles.question]}>{card.question}</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="Type your answer here"
        placeholderTextColor={globalColors.placeholder}
        value={answer}
        onChangeText={setAnswer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    marginVertical: 10,
  },
  question: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
});

export default FillInTheBlankCard;
