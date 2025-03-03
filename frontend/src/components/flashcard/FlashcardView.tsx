import React, { useRef, useState } from "react";
import { StyleSheet, View, Animated, Dimensions } from "react-native";
import {
  Card,
  IconButton,
  useTheme,
  Button,
  Divider,
  Chip,
  Surface,
} from "react-native-paper";
import { Flashcard } from "@src/types";
import AudioControl from "@components/ui/AudioControl";
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
        elevation={1}
        onPress={flipCard}
      >
        <Animated.View style={[{ opacity: fadeAnim }, styles.animatedView]}>
          {!flipped ? (
            // Front of card
            <View style={styles.cardContent}>
              {/* Word section */}
              <View
                style={[
                  styles.wordContainer,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <CustomText
                  variant="headlineSmall"
                  style={[styles.mainText, { color: theme.colors.onPrimary }]}
                >
                  {flashcard.frontWord}
                </CustomText>
              </View>

              {/* Image section */}
              {flashcard.imageUrl && (
                <Card.Cover
                  source={{ uri: flashcard.imageUrl }}
                  style={styles.cardImage}
                />
              )}

              {/* Audio section */}
              {flashcard.audioUrl && (
                <AudioControl
                  url={flashcard.audioUrl}
                  style={styles.audioControl}
                />
              )}

              {/* Example section */}
              {flashcard.exampleSentence && (
                <View style={styles.exampleSection}>
                  <CustomText
                    variant="labelLarge"
                    style={[
                      styles.sectionTitle,
                      { color: theme.colors.primary },
                    ]}
                  >
                    Example:
                  </CustomText>
                  <CustomText variant="bodyLarge" style={styles.exampleText}>
                    {flashcard.exampleSentence}
                  </CustomText>
                </View>
              )}
            </View>
          ) : (
            // Back of card
            <View style={styles.cardContent}>
              {/* Word section */}
              <View
                style={[
                  styles.wordContainer,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <CustomText
                  variant="headlineSmall"
                  style={[styles.mainText, { color: theme.colors.onPrimary }]}
                >
                  {flashcard.backWord}
                </CustomText>
              </View>

              {/* Image section */}
              {flashcard.imageUrl && (
                <Card.Cover
                  source={{ uri: flashcard.imageUrl }}
                  style={styles.cardImage}
                />
              )}

              {/* Audio section */}
              {flashcard.audioUrl && (
                <AudioControl
                  url={flashcard.audioUrl}
                  style={styles.audioControl}
                />
              )}

              {/* Example section */}
              {flashcard.exampleSentence && (
                <View style={styles.exampleSection}>
                  <CustomText
                    variant="labelLarge"
                    style={[
                      styles.sectionTitle,
                      { color: theme.colors.primary },
                    ]}
                  >
                    Example:
                  </CustomText>
                  <CustomText variant="bodyLarge" style={styles.exampleText}>
                    {flashcard.exampleSentence}
                  </CustomText>

                  {flashcard.exampleSentenceTranslation && (
                    <CustomText
                      variant="bodyMedium"
                      style={styles.translationText}
                    >
                      {flashcard.exampleSentenceTranslation}
                    </CustomText>
                  )}
                </View>
              )}

              {/* Notes section */}
              {flashcard.notes && (
                <View style={styles.notesSection}>
                  <CustomText
                    variant="labelLarge"
                    style={[
                      styles.sectionTitle,
                      { color: theme.colors.primary },
                    ]}
                  >
                    Notes:
                  </CustomText>
                  <CustomText variant="bodyMedium" style={styles.notesText}>
                    {flashcard.notes}
                  </CustomText>
                </View>
              )}
            </View>
          )}
        </Animated.View>

        {/* Bottom info bar with level and flip indicator */}
        <View style={styles.bottomInfoBar}>
          {/* Level indicator */}
          {flashcard.level && (
            <Chip
              style={[
                styles.levelChip,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
              textStyle={{
                fontWeight: "bold",
                fontSize: 12,
                color: theme.colors.onPrimaryContainer,
              }}
            >
              Level {flashcard.level}
            </Chip>
          )}

          {/* Flip indicator */}
          <View style={styles.flipIndicator}>
            <CustomText
              variant="labelSmall"
              style={{ color: theme.colors.outline }}
            >
              Tap to flip
            </CustomText>
            <IconButton
              icon="gesture-tap"
              size={14}
              iconColor={theme.colors.outline}
              style={{ margin: 0, padding: 0 }}
            />
          </View>
        </View>
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
    justifyContent: "space-between",
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 12,
    minHeight: 280,
    position: "relative",
  },
  animatedView: {
    width: "100%",
  },
  cardContent: {
    padding: 0,
    position: "relative",
    paddingBottom: 40, // Space for bottom info bar
  },
  wordContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  mainText: {
    textAlign: "center",
    fontWeight: "700",
    letterSpacing: 0.25,
    marginBottom: 0,
  },
  bottomInfoBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  levelChip: {
    height: 28,
    borderRadius: 14,
  },
  flipIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardImage: {
    height: 150,
    marginTop: 10,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  audioControl: {
    alignSelf: "center",
    marginVertical: 4,
  },
  exampleSection: {
    padding: 12,
    paddingTop: 6,
  },
  notesSection: {
    padding: 12,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    marginBottom: 4,
    fontWeight: "600",
  },
  exampleText: {
    lineHeight: 20,
    marginBottom: 2,
  },
  translationText: {
    fontStyle: "italic",
    opacity: 0.8,
    lineHeight: 18,
  },
  notesText: {
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 6,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
});

export default FlashcardView;
