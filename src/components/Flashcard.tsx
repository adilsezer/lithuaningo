import { LearningCard } from "@src/services/FirebaseDataService";
import React, { useState } from "react";
import { View, Text, Button } from "react-native";

interface FlashcardProps {
  card: LearningCard;
  onMarkMastered: (id: string) => void;
  onReviewAgain: (id: string) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({
  card,
  onMarkMastered,
  onReviewAgain,
}) => {
  const [showTranslation, setShowTranslation] = useState(false);

  return (
    <View>
      <Text>{showTranslation ? card.baseFormTranslation : card.baseForm}</Text>
      <Button title="Show Answer" onPress={() => setShowTranslation(true)} />
      <Button title="Mastered" onPress={() => onMarkMastered(card.id)} />
      <Button title="Review Again" onPress={() => onReviewAgain(card.id)} />
    </View>
  );
};

export default Flashcard;
