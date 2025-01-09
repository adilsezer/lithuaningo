import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Flashcard } from "@src/types";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { FontAwesome5 } from "@expo/vector-icons";
import CustomButton from "@components/ui/CustomButton";

interface FlashcardViewProps {
  flashcard: Flashcard;
  onAnswer: (isCorrect: boolean) => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  flashcard,
  onAnswer,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { colors } = useThemeStyles();

  const handleFlip = () => setIsFlipped(!isFlipped);

  const renderCardContent = () => (
    <View style={styles.content}>
      <Text style={[styles.mainText, { color: colors.text }]}>
        {isFlipped ? flashcard.back : flashcard.front}
      </Text>
      {flashcard.exampleSentence && !isFlipped && (
        <Text style={[styles.exampleText, { color: colors.cardText }]}>
          Example: {flashcard.exampleSentence}
        </Text>
      )}
      <FontAwesome5
        name="undo"
        size={16}
        color={colors.cardText}
        style={styles.flipIcon}
      />
    </View>
  );

  const renderAnswerButtons = () => (
    <View style={styles.answerButtons}>
      <CustomButton
        title="Incorrect"
        onPress={() => {
          onAnswer(false);
          setIsFlipped(false);
        }}
        style={[styles.button, { backgroundColor: colors.error }]}
      />
      <CustomButton
        title="Correct"
        onPress={() => {
          onAnswer(true);
          setIsFlipped(false);
        }}
        style={[styles.button, { backgroundColor: colors.success }]}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleFlip}
        style={[styles.card, { backgroundColor: colors.card }]}
        activeOpacity={0.8}
      >
        {renderCardContent()}
      </TouchableOpacity>
      {isFlipped && renderAnswerButtons()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 24,
  },
  content: {
    alignItems: "center",
    padding: 16,
    width: "100%",
  },
  mainText: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  exampleText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 16,
  },
  flipIcon: {
    position: "absolute",
    bottom: 16,
    right: 16,
    opacity: 0.5,
  },
  answerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
  },
});
