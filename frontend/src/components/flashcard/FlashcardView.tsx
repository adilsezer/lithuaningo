import React, { useRef, useState, useEffect } from "react";
import { StyleSheet, View, Animated, Image } from "react-native";
import { Card, IconButton, useTheme, Button } from "react-native-paper";
import { Flashcard } from "@src/types";
import AudioControl from "@components/ui/AudioControl";
import { useFlashcardStats } from "@hooks/useFlashcardStats";
import { useUserData } from "@stores/useUserStore";
import CustomText from "@components/ui/CustomText";
import { formatDistanceToNow } from "date-fns";

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
  const [startTime] = useState(Date.now());

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
      const timeTakenSeconds = Math.round((Date.now() - startTime) / 1000);
      await trackProgress(flashcard.deckId, {
        userId: userData.id,
        flashcardId: flashcard.id,
        isCorrect,
        timeTakenSeconds,
        confidenceLevel: isCorrect ? 4 : 2, // Basic confidence level based on correctness
      });
    }
    onAnswer(isCorrect);
    setFlipped(false);
    fadeAnim.setValue(1);
  };

  const renderCardContent = (isBack: boolean) => (
    <>
      <CustomText variant="bodyLarge" style={styles.text}>
        {isBack ? flashcard.backWord : flashcard.frontWord}
      </CustomText>
      {!isBack && flashcard.exampleSentence && (
        <CustomText variant="bodyMedium" style={styles.example}>
          {flashcard.exampleSentence}
        </CustomText>
      )}
      {isBack && flashcard.exampleSentenceTranslation && (
        <CustomText variant="bodyMedium" style={styles.example}>
          {flashcard.exampleSentenceTranslation}
        </CustomText>
      )}
      {flashcard.imageUrl && (
        <Image source={{ uri: flashcard.imageUrl }} style={styles.image} />
      )}
      {flashcard.audioUrl && (
        <AudioControl
          url={flashcard.audioUrl}
          onPress={(e) => e.stopPropagation()}
        />
      )}
      <CustomText variant="bodyMedium" style={styles.stats}>
        {isBack ? (
          `Created: ${formatDistanceToNow(new Date(flashcard.createdAt), {
            addSuffix: true,
          })}`
        ) : (
          <>
            Reviews: {stats?.totalReviewed || 0} | Success Rate:{" "}
            {stats?.accuracyRate
              ? `${Math.round(stats.accuracyRate * 100)}%`
              : "N/A"}
          </>
        )}
      </CustomText>
      {!isBack && stats?.lastReviewedAt && (
        <CustomText variant="bodySmall" style={styles.timeAgo}>
          Last reviewed:{" "}
          {formatDistanceToNow(new Date(stats.lastReviewedAt), {
            addSuffix: true,
          })}
        </CustomText>
      )}
      {!isBack && stats?.nextReviewDue && (
        <CustomText variant="bodySmall" style={styles.nextReview}>
          Next review: {stats.nextReviewDue}
        </CustomText>
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
  example: {
    textAlign: "center",
    marginVertical: 8,
    fontStyle: "italic",
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
