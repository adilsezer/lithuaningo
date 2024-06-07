import React, { useState } from "react";
import { View, Text, Button } from "react-native";
import { LearningCard } from "@src/services/FirebaseDataService";
import BackButton from "./BackButton";

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
  const [showBack, setShowBack] = useState(false);

  if (!card) {
    return (
      <View>
        <BackButton />
        <Text>No card available</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>{showBack ? card.baseFormTranslation : card.baseForm}</Text>
      <Button
        title={showBack ? "Show Front" : "Show Back"}
        onPress={() => setShowBack(!showBack)}
      />
      <Button title="Mastered" onPress={() => onMastered(card.id)} />
      <Button title="Review Again" onPress={() => onReviewAgain(card.id)} />
    </View>
  );
};

export default Flashcard;
