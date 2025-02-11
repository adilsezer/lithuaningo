import React, { useRef, useState, useEffect } from "react";
import { StyleSheet, View, Animated, Image } from "react-native";
import { Card, Text, IconButton, useTheme, Button } from "react-native-paper";
import { Flashcard } from "@src/types";
import AudioControl from "@components/ui/AudioControl";
import { useFlashcardStats } from "@hooks/useFlashcardStats";
import { useUserData } from "@stores/useUserStore";

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
  const { stats, getUserFlashcardStats, trackProgress } = useFlashcardStats();
  const userData = useUserData();

  useEffect(() => {
    if (userData?.id && flashcard.deckId) {
      getUserFlashcardStats(flashcard.deckId, userData.id);
    }
  }, [userData?.id, flashcard.deckId, getUserFlashcardStats]);

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

  const handleAnswer = async (isCorrect: boolean) => {
    if (userData?.id) {
      await trackProgress(flashcard.deckId, {
        flashcardId: flashcard.id,
        isCorrect,
      });
    }
    onAnswer(isCorrect);
    setFlipped(false);
    fadeAnim.setValue(1);
  };

  const renderCardContent = (isBack: boolean) => (
    <>
      <Text variant="bodyLarge" style={styles.text}>
        {isBack ? flashcard.backText : flashcard.frontText}
      </Text>
      {flashcard.imageUrl && (
        <Image source={{ uri: flashcard.imageUrl }} style={styles.image} />
      )}
      {flashcard.audioUrl && (
        <AudioControl
          url={flashcard.audioUrl}
          onPress={(e) => e.stopPropagation()}
        />
      )}
      <Text variant="bodyMedium" style={styles.stats}>
        {isBack ? (
          `Created: ${flashcard.timeAgo}`
        ) : (
          <>
            Reviews: {stats?.totalReviewed || 0} | Success Rate:{" "}
            {stats?.accuracyRate ? `${Math.round(stats.accuracyRate)}%` : "N/A"}
          </>
        )}
      </Text>
      {!isBack && stats?.lastReviewedTimeAgo && (
        <Text variant="bodySmall" style={styles.timeAgo}>
          Last reviewed: {stats.lastReviewedTimeAgo}
        </Text>
      )}
      {!isBack && stats?.nextReviewDue && (
        <Text variant="bodySmall" style={styles.nextReview}>
          Next review: {stats.nextReviewDue}
        </Text>
      )}
    </>
  );

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
            {renderCardContent(flipped)}
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
    minHeight: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    textAlign: "center",
    marginVertical: 12,
  },
  stats: {
    textAlign: "center",
    marginTop: 8,
  },
  timeAgo: {
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 4,
  },
  nextReview: {
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 4,
    color: "gray",
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
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginVertical: 12,
  },
});

export default FlashcardView;
