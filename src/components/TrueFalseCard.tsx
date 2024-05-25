import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { LearningCard } from "../services/FirebaseDataService";

interface TrueFalseCardProps {
  card: LearningCard;
}

const TrueFalseCard: React.FC<TrueFalseCardProps> = ({ card }) => {
  return (
    <View>
      <Text style={styles.question}>{card.question}</Text>
      <View style={styles.trueFalseContainer}>
        <Button title="True" onPress={() => {}} />
        <Button title="False" onPress={() => {}} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  question: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  trueFalseContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
  },
});

export default TrueFalseCard;
