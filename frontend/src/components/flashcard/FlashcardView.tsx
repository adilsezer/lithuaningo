import React, { useRef, useState } from "react";
import { StyleSheet, View, Animated } from "react-native";
import { Card, Text, IconButton, useTheme, Button } from "react-native-paper";
import { Flashcard } from "@src/types";
import AudioControl from "@components/ui/AudioControl";

interface FlashcardViewProps {
  flashcard: Flashcard;
  onAnswer: (isCorrect: boolean) => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  flashcard,
  onAnswer,
}) => {
  const [flipped, setFlipped] = useState(false);
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const flipCard = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setFlipped((prev) => !prev);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleAnswer = (isCorrect: boolean) => {
    onAnswer(isCorrect);
    setFlipped(false);
    fadeAnim.setValue(1);
  };

  return (
    <View style={styles.container}>
      <Card
        style={[
          styles.card,
          {
            borderColor: theme.colors.primary,
            borderWidth: 1,
          },
        ]}
        onPress={flipCard}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <Card.Content style={styles.cardContent}>
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
                {flashcard.audioUrl && (
                  <AudioControl
                    url={flashcard.audioUrl}
                    onPress={(e) => e.stopPropagation()} // Prevent card flip
                  />
                )}
              </>
            ) : (
              <>
                <Text variant="bodyLarge" style={styles.text}>
                  {flashcard.back}
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
                {flashcard.audioUrl && (
                  <AudioControl
                    url={flashcard.audioUrl}
                    onPress={(e) => e.stopPropagation()} // Prevent card flip
                  />
                )}
              </>
            )}
          </Card.Content>
        </Animated.View>
        <View style={styles.flipIndicator}>
          <IconButton
            icon="rotate-3d"
            size={20}
            onPress={(e) => {
              e.stopPropagation();
              flipCard();
            }}
          />
        </View>
      </Card>
      {flipped && (
        <View style={styles.actions}>
          <Button mode="outlined" onPress={() => handleAnswer(false)}>
            Incorrect
          </Button>
          <Button mode="contained" onPress={() => handleAnswer(true)}>
            Correct
          </Button>
        </View>
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
  cardContent: {
    minHeight: 400,
    justifyContent: "center",
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
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
  },
  flipIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
});

export default FlashcardView;
