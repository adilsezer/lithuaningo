import React, { useRef, useState, useEffect } from "react";
import { StyleSheet, View, Animated } from "react-native";
import {
  Card,
  IconButton,
  useTheme,
  Button,
  Divider,
  Surface,
} from "react-native-paper";
import { Flashcard } from "@src/types";
import AudioControl from "@components/ui/AudioControl";
import { useFlashcardStats } from "@hooks/useFlashcardStats";
import { useUserData } from "@stores/useUserStore";
import CustomText from "@components/ui/CustomText";

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
  const { trackProgress } = useFlashcardStats();
  const userData = useUserData();
  const [startTime] = useState(Date.now());

  const flipCard = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setFlipped((prev) => !prev);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
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
        confidenceLevel: isCorrect ? 4 : 2,
      });
    }
    onAnswer(isCorrect);
    setFlipped(false);
    fadeAnim.setValue(1);
  };

  const renderCardContent = (isBack: boolean) => (
    <View style={styles.cardContent}>
      <View style={styles.contentWrapper}>
        {flashcard.imageUrl && (
          <Card.Cover
            source={{ uri: flashcard.imageUrl }}
            style={{ borderRadius: 8 }}
          />
        )}
        <CustomText variant="headlineMedium" style={styles.mainText}>
          {isBack ? flashcard.backWord : flashcard.frontWord}
        </CustomText>

        {flashcard.level && (
          <View style={styles.levelContainer}>
            <CustomText
              variant="labelMedium"
              style={{ color: theme.colors.primary }}
            >
              Level: {flashcard.level}
            </CustomText>
          </View>
        )}

        {isBack && (
          <>
            <Divider style={{ marginVertical: 8 }} />
            <CustomText variant="titleMedium" style={{ marginBottom: 4 }}>
              Example:
            </CustomText>
            <CustomText variant="bodyMedium" style={{ marginBottom: 8 }}>
              {flashcard.exampleSentence}
            </CustomText>
            <CustomText variant="bodyMedium" style={{ marginBottom: 16 }}>
              {flashcard.exampleSentenceTranslation}
            </CustomText>

            {flashcard.notes && (
              <>
                <Divider style={{ marginVertical: 8 }} />
                <CustomText variant="titleMedium" style={{ marginBottom: 4 }}>
                  Notes:
                </CustomText>
                <CustomText variant="bodyMedium" style={{ marginBottom: 16 }}>
                  {flashcard.notes}
                </CustomText>
              </>
            )}
          </>
        )}

        {flashcard.audioUrl && (
          <AudioControl
            url={flashcard.audioUrl}
            style={{ marginTop: "auto" }}
          />
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container]}>
      <Card
        style={[styles.card, { borderColor: theme.colors.primary }]}
        onPress={flipCard}
      >
        <Animated.View style={[{ opacity: fadeAnim }, styles.animatedView]}>
          <Card.Content style={styles.cardContent}>
            {renderCardContent(flipped)}
          </Card.Content>
        </Animated.View>

        <IconButton
          icon="rotate-3d"
          mode="contained"
          size={24}
          style={styles.flipButton}
          onPress={(e) => {
            e.stopPropagation();
            flipCard();
          }}
        />
      </Card>

      {flipped && (
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => handleAnswer(false)}
            style={styles.actionButton}
            contentStyle={styles.buttonContent}
            icon="close"
          >
            Incorrect
          </Button>
          <Button
            mode="contained"
            onPress={() => handleAnswer(true)}
            style={styles.actionButton}
            contentStyle={styles.buttonContent}
            icon="check"
          >
            Correct
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: 12,
    flex: 1,
    borderWidth: 1,
  },
  animatedView: {
    width: "100%",
    height: "100%",
  },
  cardContent: {
    padding: 16,
    height: "100%",
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  mainText: {
    textAlign: "center",
    marginVertical: 16,
    fontWeight: "700",
  },
  divider: {
    marginBottom: 16,
  },
  sentenceContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  example: {
    textAlign: "center",
    fontStyle: "italic",
  },
  image: {
    height: 180,
    marginBottom: 16,
    borderRadius: 8,
  },
  audioContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  flipButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
  },
  levelContainer: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginTop: 8,
  },
});

export default FlashcardView;
