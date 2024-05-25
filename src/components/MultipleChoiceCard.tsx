import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { LearningCard } from "../services/FirebaseDataService";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import CustomButton from "./CustomButton";

interface MultipleChoiceCardProps {
  card: LearningCard;
}

const MultipleChoiceCard: React.FC<MultipleChoiceCardProps> = ({ card }) => {
  const { styles: globalStyles } = useThemeStyles();

  if (!card.options) {
    return null;
  }

  function handlePress(): void {
    throw new Error("Function not implemented.");
  }

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
          onPress={handlePress}
          style={[globalStyles.button, { paddingVertical: 14 }]}
        />
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
  },
});

export default MultipleChoiceCard;
