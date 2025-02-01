import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text, IconButton, useTheme, Button } from "react-native-paper";
import { Flashcard } from "@src/types";
import { useFlashcards } from "@hooks/useFlashcards";

interface FlashcardViewProps {
  flashcard: Flashcard;
  onAnswer: (isCorrect: boolean) => void;
}

const AudioControl: React.FC<{ url: string }> = ({ url }) => {
  const { handlePlaySound, isPlaying } = useFlashcards();
  const theme = useTheme();

  const handlePress = (e: any) => {
    // Prevent the card's onPress (flip) from firing.
    e.stopPropagation();
    handlePlaySound(url);
  };

  return (
    <IconButton
      icon={isPlaying(url) ? "pause" : "volume-high"}
      size={28}
      onPress={handlePress}
      containerColor={theme.colors.primary}
      iconColor={theme.colors.onPrimary}
      style={styles.audioButton}
    />
  );
};

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  flashcard,
  onAnswer,
}) => {
  const [flipped, setFlipped] = useState(false);
  const theme = useTheme();

  const handleFlip = () => setFlipped((prev) => !prev);

  const handleAnswer = (isCorrect: boolean) => {
    onAnswer(isCorrect);
    setFlipped(false);
  };

  return (
    <View style={styles.container}>
      {/* The entire card is clickable to flip */}
      <Card style={styles.card} onPress={handleFlip}>
        <Card.Content>
          {!flipped ? (
            <>
              <Text variant="bodyLarge" style={styles.text}>
                {flashcard.front}
              </Text>
              {flashcard.imageUrl && (
                <Card.Cover
                  source={{ uri: flashcard.imageUrl }}
                  style={styles.cover}
                />
              )}
              {flashcard.exampleSentence && (
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.example,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Example: {flashcard.exampleSentence}
                </Text>
              )}
              {flashcard.audioUrl && <AudioControl url={flashcard.audioUrl} />}
            </>
          ) : (
            <Text variant="bodyLarge" style={styles.text}>
              {flashcard.back}
            </Text>
          )}
        </Card.Content>
      </Card>
      {flipped && (
        <Card.Actions style={styles.actions}>
          <Button mode="outlined" onPress={() => handleAnswer(false)}>
            Incorrect
          </Button>
          <Button mode="contained" onPress={() => handleAnswer(true)}>
            Correct
          </Button>
        </Card.Actions>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  card: {
    borderRadius: 12,
    elevation: 4,
  },
  cover: {
    borderRadius: 8,
    marginVertical: 12,
  },
  text: {
    textAlign: "center",
    marginVertical: 12,
  },
  example: {
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 12,
  },
  actions: {
    justifyContent: "space-around",
    padding: 16,
  },
  audioButton: {
    alignSelf: "center",
    marginTop: 12,
  },
});

export default FlashcardView;
