import React, { useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { LearningCard } from "@src/services/FirebaseDataService";
import CustomButton from "./CustomButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

interface FlashcardProps {
  card: LearningCard;
  onMastered: (cardId: string) => void;
  onReviewAgain: (cardId: string) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({
  card,
  onMastered,
  onReviewAgain,
}) => {
  const [answerShown, setAnswerShown] = useState(false);
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  if (!card) {
    return (
      <View>
        <Text>No card available</Text>
      </View>
    );
  }

  const handleShowAnswer = () => {
    setAnswerShown(true);
  };

  return (
    <View>
      <Image source={{ uri: card.image }} style={styles.image} />
      <Text style={globalStyles.title}>
        {answerShown ? (
          <>
            {card.baseForm}
            {"\n"}
            <Text style={{ color: globalColors.primary }}>
              {card.baseFormTranslation}
            </Text>
          </>
        ) : (
          card.baseForm
        )}
      </Text>

      {!answerShown && (
        <CustomButton title="Show Answer" onPress={handleShowAnswer} />
      )}
      {answerShown && (
        <View>
          <CustomButton title="Mastered" onPress={() => onMastered(card.id)} />
          <CustomButton
            title="Review Again"
            onPress={() => onReviewAgain(card.id)}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
    marginBottom: 10,
    alignSelf: "center",
    borderRadius: 10,
  },
});

export default Flashcard;
