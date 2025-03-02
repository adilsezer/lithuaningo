import React, { useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Animated,
  Dimensions,
  SafeAreaView,
} from "react-native";
import {
  Card,
  IconButton,
  useTheme,
  Button,
  Divider,
  Chip,
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

  return (
    <View style={styles.container}>
      <Card
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
          },
        ]}
        elevation={3}
        onPress={flipCard}
      >
        <Animated.View style={[{ opacity: fadeAnim }, styles.animatedView]}>
          {!flipped ? (
            // Front of card
            <View style={styles.cardContent}>
              {/* Main content */}
              <View style={styles.contentWrapper}>
                <CustomText
                  variant="headlineMedium"
                  style={[styles.mainText, { color: theme.colors.onSurface }]}
                >
                  {flashcard.frontWord}
                </CustomText>

                <Divider
                  style={[
                    styles.divider,
                    { backgroundColor: theme.colors.outlineVariant },
                  ]}
                />

                {flashcard.imageUrl && (
                  <Card.Cover
                    source={{ uri: flashcard.imageUrl }}
                    style={styles.cardImage}
                  />
                )}

                {flashcard.audioUrl && (
                  <AudioControl
                    url={flashcard.audioUrl}
                    style={styles.audioControl}
                  />
                )}

                <Divider
                  style={[
                    styles.divider,
                    { backgroundColor: theme.colors.outlineVariant },
                  ]}
                />

                <CustomText
                  variant="titleMedium"
                  style={[
                    styles.sectionTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  Example:
                </CustomText>

                <CustomText
                  variant="bodyLarge"
                  style={[
                    styles.exampleText,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {flashcard.exampleSentence}
                </CustomText>
              </View>

              {/* Level indicator at bottom */}
              {flashcard.level && (
                <View style={styles.levelContainer}>
                  <Chip
                    style={styles.levelChip}
                    textStyle={{ color: theme.colors.primary }}
                  >
                    Level: {flashcard.level}
                  </Chip>
                </View>
              )}
            </View>
          ) : (
            // Back of card
            <View style={styles.cardContent}>
              {/* Main content */}
              <View style={styles.contentWrapper}>
                <CustomText
                  variant="headlineMedium"
                  style={[styles.mainText, { color: theme.colors.onSurface }]}
                >
                  {flashcard.backWord}
                </CustomText>

                <Divider
                  style={[
                    styles.divider,
                    { backgroundColor: theme.colors.outlineVariant },
                  ]}
                />

                {flashcard.imageUrl && (
                  <Card.Cover
                    source={{ uri: flashcard.imageUrl }}
                    style={styles.cardImage}
                  />
                )}

                {flashcard.audioUrl && (
                  <AudioControl
                    url={flashcard.audioUrl}
                    style={styles.audioControl}
                  />
                )}

                <Divider
                  style={[
                    styles.divider,
                    { backgroundColor: theme.colors.outlineVariant },
                  ]}
                />

                <CustomText
                  variant="titleMedium"
                  style={[
                    styles.sectionTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  Example:
                </CustomText>

                <CustomText
                  variant="bodyLarge"
                  style={[
                    styles.exampleText,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {flashcard.exampleSentence}
                </CustomText>

                <CustomText
                  variant="bodyMedium"
                  style={[
                    styles.translationText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {flashcard.exampleSentenceTranslation}
                </CustomText>

                {flashcard.notes && (
                  <>
                    <Divider
                      style={[
                        styles.divider,
                        { backgroundColor: theme.colors.outlineVariant },
                      ]}
                    />
                    <CustomText
                      variant="titleMedium"
                      style={[
                        styles.sectionTitle,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      Notes:
                    </CustomText>
                    <CustomText
                      variant="bodyMedium"
                      style={[
                        styles.notesText,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {flashcard.notes}
                    </CustomText>
                  </>
                )}
              </View>

              {/* Level indicator at bottom */}
              {flashcard.level && (
                <View style={styles.levelContainer}>
                  <Chip
                    style={styles.levelChip}
                    textStyle={{ color: theme.colors.primary }}
                  >
                    Level: {flashcard.level}
                  </Chip>
                </View>
              )}
            </View>
          )}
        </Animated.View>

        <IconButton
          icon="rotate-3d"
          mode="contained-tonal"
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
            style={[styles.actionButton, { borderColor: theme.colors.error }]}
            contentStyle={styles.buttonContent}
            icon="close"
            textColor={theme.colors.error}
          >
            Incorrect
          </Button>
          <Button
            mode="contained"
            onPress={() => handleAnswer(true)}
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.primary },
            ]}
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
    justifyContent: "space-between",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
    minHeight: 400,
  },
  animatedView: {
    width: "100%",
  },
  cardContent: {
    padding: 20,
    paddingBottom: 60, // Space for level chip
    position: "relative",
  },
  contentWrapper: {
    paddingBottom: 10,
  },
  mainText: {
    textAlign: "center",
    marginVertical: 12,
    fontWeight: "700",
  },
  divider: {
    marginVertical: 16,
    height: 1,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: "600",
  },
  exampleText: {
    marginBottom: 8,
  },
  translationText: {
    fontStyle: "italic",
    marginBottom: 16,
    opacity: 0.8,
  },
  notesText: {
    marginBottom: 16,
  },
  cardImage: {
    borderRadius: 12,
    marginBottom: 16,
    height: 160,
    alignSelf: "center",
    width: "90%",
  },
  audioControl: {
    alignSelf: "center",
    marginVertical: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 10,
  },
  flipButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    zIndex: 10,
  },
  levelContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
    alignItems: "center",
  },
  levelChip: {
    marginBottom: 0,
  },
});

export default FlashcardView;
