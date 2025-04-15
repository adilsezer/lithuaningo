import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, useTheme } from "react-native-paper";
import { FlashcardResponse } from "@src/types/Flashcard";
import CustomText from "./CustomText";
import CustomDivider from "./CustomDivider";
import Icon from "@expo/vector-icons/MaterialIcons";

interface FlashcardProps {
  flashcard: FlashcardResponse;
  flipped: boolean;
  onPress: () => void;
}

export default function Flashcard({
  flashcard,
  flipped,
  onPress,
}: FlashcardProps) {
  const theme = useTheme();

  // Choose different background colors based on flipped state
  const cardBackgroundColor = flipped
    ? theme.colors.primaryContainer
    : theme.colors.secondaryContainer;

  return (
    <Card
      style={[styles.card, { backgroundColor: cardBackgroundColor }]}
      onPress={onPress}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.flipIconContainer}>
          <Icon name="3d-rotation" size={24} color={theme.colors.onSurface} />
          <CustomText variant="bodySmall" style={styles.flipText}>
            Tap to flip
          </CustomText>
        </View>

        <View style={styles.contentContainer}>
          <CustomText variant="headlineSmall" style={styles.cardText}>
            {flipped ? flashcard.backText : flashcard.frontText}
          </CustomText>

          {flipped && flashcard.exampleSentence && (
            <View style={styles.exampleContainer}>
              <CustomDivider />
              <CustomText variant="bodyMedium" style={styles.exampleText}>
                {flashcard.exampleSentence}
              </CustomText>
              <CustomText variant="bodySmall" style={styles.translationText}>
                {flashcard.exampleSentenceTranslation}
              </CustomText>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 300,
    borderRadius: 16,
    marginVertical: 16,
  },
  cardContent: {
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 300,
    padding: 20,
    position: "relative",
  },
  flipIconContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.5,
  },
  flipText: {
    marginLeft: 8,
  },
  contentContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  cardText: {
    textAlign: "center",
    marginBottom: 8,
  },
  exampleContainer: {
    marginTop: 16,
    width: "100%",
  },
  exampleText: {
    fontStyle: "italic",
    marginVertical: 4,
    textAlign: "center",
  },
  translationText: {
    textAlign: "center",
  },
});
