import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { Card, useTheme, Chip } from "react-native-paper";
import { FlashcardResponse, DifficultyLevel } from "@src/types/Flashcard";
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

  // Get difficulty label based on difficulty level
  const getDifficultyLabel = (difficulty: DifficultyLevel): string => {
    switch (difficulty) {
      case DifficultyLevel.Basic:
        return "Basic";
      case DifficultyLevel.Intermediate:
        return "Intermediate";
      case DifficultyLevel.Advanced:
        return "Advanced";
      default:
        return "Unknown";
    }
  };

  // Simplified content rendering
  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.primary,
        },
      ]}
      onPress={onPress}
    >
      <Card.Content style={styles.cardContent}>
        {/* Verification badge */}
        <View style={styles.headerContainer}>
          {/* Difficulty level (only show when flipped) */}
          <Chip
            style={[
              styles.difficultyChip,
              { backgroundColor: theme.colors.secondaryContainer },
            ]}
            textStyle={{
              fontSize: 12,
              color: theme.colors.onSecondaryContainer,
            }}
            compact
          >
            {getDifficultyLabel(flashcard.difficulty)}
          </Chip>

          {!flashcard.isVerified && (
            <Chip
              icon="check-decagram"
              style={[
                styles.verifiedBadge,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
              textStyle={{
                fontSize: 12,
                color: theme.colors.onPrimaryContainer,
              }}
              compact
            >
              Verified by Lithuaningo
            </Chip>
          )}
        </View>

        {/* Main content area */}
        <View style={styles.contentContainer}>
          {/* Card content based on flipped state */}
          {flipped ? (
            <>
              {/* Back side of card */}
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

              {/* Notes section */}
              {flashcard.notes && (
                <View style={styles.notesContainer}>
                  <CustomDivider />
                  <CustomText variant="bodyMedium" style={styles.notesTitle}>
                    Notes:
                  </CustomText>
                  <CustomText variant="bodySmall" style={styles.notesText}>
                    {flashcard.notes}
                  </CustomText>
                </View>
              )}
            </>
          ) : (
            // Front side of card
            <CustomText variant="headlineSmall" style={styles.cardText}>
              {flashcard.frontText}
            </CustomText>
          )}
        </View>

        {/* Spacer to ensure consistent spacing */}
        <View style={styles.spacer} />

        {/* Flip indicator at the bottom */}
        <View style={styles.flipIndicator}>
          <Icon
            name="3d-rotation"
            size={20}
            color={theme.colors.onSurfaceVariant}
          />
          <CustomText
            variant="bodySmall"
            style={{ marginLeft: 8, color: theme.colors.onSurfaceVariant }}
          >
            Tap to flip
          </CustomText>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
  },
  cardContent: {
    padding: 16,
    minHeight: 250,
    display: "flex",
    flexDirection: "column",
  },
  headerContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  contentContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  spacer: {
    height: 16,
  },
  verifiedBadge: {
    borderRadius: 4,
  },
  difficultyChip: {
    borderRadius: 4,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 16,
  },
  cardText: {
    textAlign: "center",
    marginBottom: 16,
  },
  exampleContainer: {
    width: "100%",
    marginTop: 8,
  },
  exampleText: {
    fontStyle: "italic",
    marginBottom: 8,
    textAlign: "center",
  },
  translationText: {
    textAlign: "center",
  },
  notesContainer: {
    width: "100%",
    marginTop: 12,
  },
  notesTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  notesText: {
    lineHeight: 18,
  },
  flipIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.7,
    width: "100%",
  },
});
