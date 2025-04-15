import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { Card, useTheme } from "react-native-paper";
import { FlashcardResponse } from "@src/types/Flashcard";
import CustomText from "./CustomText";
import CustomDivider from "./CustomDivider";
import Icon from "@expo/vector-icons/MaterialIcons";
import AudioPlayer from "./AudioPlayer";

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
        <View style={styles.contentContainer}>
          {flipped && (
            <>
              {flashcard.imageUrl && (
                <Image
                  source={{ uri: flashcard.imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
              )}

              <CustomText variant="headlineSmall" style={styles.cardText}>
                {flashcard.backText}
              </CustomText>

              {flashcard.audioUrl && (
                <AudioPlayer audioUrl={flashcard.audioUrl} />
              )}

              {flashcard.exampleSentence && (
                <View style={styles.exampleContainer}>
                  <CustomDivider />
                  <CustomText variant="bodyLarge" style={styles.exampleText}>
                    {flashcard.exampleSentence}
                  </CustomText>
                  <CustomText
                    variant="bodyMedium"
                    style={styles.translationText}
                  >
                    {flashcard.exampleSentenceTranslation}
                  </CustomText>
                </View>
              )}
            </>
          )}

          {!flipped && (
            <CustomText variant="headlineSmall" style={styles.cardText}>
              {flashcard.frontText}
            </CustomText>
          )}
        </View>

        <View style={styles.flipIconContainer}>
          <Icon name="3d-rotation" size={24} color={theme.colors.onSurface} />
          <CustomText variant="bodySmall" style={styles.flipText}>
            Tap to flip
          </CustomText>
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
    justifyContent: "center",
    minHeight: 300,
    padding: 20,
    position: "relative",
    paddingBottom: 60,
  },
  flipIconContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.5,
    zIndex: 10,
  },
  flipText: {
    marginLeft: 8,
  },
  contentContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
  },
  cardText: {
    textAlign: "center",
    marginBottom: 16,
  },
  exampleContainer: {
    width: "100%",
    marginTop: 8,
    marginVertical: 16,
  },
  exampleText: {
    fontStyle: "italic",
    marginBottom: 8,
    textAlign: "center",
  },
  translationText: {
    textAlign: "center",
  },
});
