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
  onFlip?: () => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  flashcard,
  onAnswer,
  onFlip,
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
      // Call the onFlip callback if provided
      if (!flipped && onFlip) {
        onFlip();
      }
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

  // Ensure we have default values for missing data
  const cardData = {
    frontWord: flashcard.frontWord || "No front text",
    backWord: flashcard.backWord || "No back text",
    imageUrl: flashcard.imageUrl || null,
    audioUrl: flashcard.audioUrl || null,
    exampleSentence: flashcard.exampleSentence || null,
    exampleSentenceTranslation: flashcard.exampleSentenceTranslation || null,
    notes: flashcard.notes || null,
    level: flashcard.level || null,
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
        {/* Card has a fixed layout with content and footer areas */}
        <View style={styles.cardInnerContainer}>
          {/* Main content area with scrolling if needed */}
          <View style={styles.contentWrapperOuter}>
            <View style={styles.contentWrapper}>
              <Animated.View
                style={[{ opacity: fadeAnim }, styles.animatedView]}
              >
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
                        style={[
                          styles.mainText,
                          { color: theme.colors.onPrimary },
                        ]}
                      >
                        {cardData.frontWord}
                      </CustomText>
                    </View>

                    {/* Content section - vertically centered with flex */}
                    <View style={styles.mainContentSection}>
                      <View style={styles.centeredContent}>
                        {/* Image section */}
                        {cardData.imageUrl && (
                          <Card.Cover
                            source={{ uri: cardData.imageUrl }}
                            style={styles.cardImage}
                          />
                        )}

                        {/* Audio section */}
                        {cardData.audioUrl && (
                          <AudioControl
                            url={cardData.audioUrl}
                            style={styles.audioControl}
                          />
                        )}

                        {/* Example section */}
                        {cardData.exampleSentence ? (
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
                            <CustomText
                              variant="bodyLarge"
                              style={styles.exampleText}
                            >
                              {cardData.exampleSentence}
                            </CustomText>
                          </View>
                        ) : (
                          <View style={styles.emptyContentPlaceholder} />
                        )}
                      </View>
                    </View>
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
                        style={[
                          styles.mainText,
                          { color: theme.colors.onPrimary },
                        ]}
                      >
                        {cardData.backWord}
                      </CustomText>
                    </View>

                    {/* Content section - vertically centered with flex */}
                    <View style={styles.mainContentSection}>
                      <View style={styles.centeredContent}>
                        {/* Image section */}
                        {cardData.imageUrl && (
                          <Card.Cover
                            source={{ uri: cardData.imageUrl }}
                            style={styles.cardImage}
                          />
                        )}

                        {/* Audio section */}
                        {cardData.audioUrl && (
                          <AudioControl
                            url={cardData.audioUrl}
                            style={styles.audioControl}
                          />
                        )}

                        {/* Example section */}
                        {cardData.exampleSentence ? (
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
                            <CustomText
                              variant="bodyLarge"
                              style={styles.exampleText}
                            >
                              {cardData.exampleSentence}
                            </CustomText>

                            {cardData.exampleSentenceTranslation && (
                              <CustomText
                                variant="bodyMedium"
                                style={styles.translationText}
                              >
                                {cardData.exampleSentenceTranslation}
                              </CustomText>
                            )}
                          </View>
                        ) : (
                          <View style={styles.emptyContentPlaceholder} />
                        )}

                        {/* Notes section */}
                        {cardData.notes && (
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
                            <CustomText
                              variant="bodyMedium"
                              style={styles.notesText}
                            >
                              {cardData.notes}
                            </CustomText>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                )}
              </Animated.View>
            </View>
          </View>

          {/* Bottom info bar with level and flip indicator - now always at the bottom */}
          <View style={styles.bottomInfoBar}>
            {/* Level indicator */}
            <View style={styles.levelContainer}>
              {cardData.level ? (
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
                  Level {cardData.level}
                </Chip>
              ) : (
                <View style={styles.emptyLevelPlaceholder} />
              )}
            </View>

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
        </View>
      </Card>

      {flipped && (
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={() => handleAnswer(false)}
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.error },
            ]}
            contentStyle={styles.buttonContent}
            icon="close"
            textColor={theme.colors.onError}
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
    marginTop: 24,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    minHeight: 280,
  },
  cardInnerContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 280,
  },
  contentWrapperOuter: {
    flex: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  contentWrapper: {
    flex: 1,
    overflow: "hidden",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  animatedView: {
    width: "100%",
  },
  cardContent: {
    padding: 0,
  },
  mainContentSection: {
    flex: 1,
    minHeight: 180, // Increased minimum height for better spacing
    justifyContent: "center", // Center content vertically
  },
  centeredContent: {
    paddingVertical: 16,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    height: 52, // Fixed height for consistency
  },
  levelContainer: {
    minWidth: 80, // Reserve space for level chip
  },
  levelChip: {
    height: 28,
    borderRadius: 14,
  },
  emptyLevelPlaceholder: {
    width: 80,
    height: 28,
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
  emptyContentPlaceholder: {
    height: 60, // Minimum height when content is missing
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
