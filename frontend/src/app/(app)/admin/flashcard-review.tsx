import React, { useState } from "react";
import { ScrollView, View, StyleSheet, Platform } from "react-native";
import { Card, Text, useTheme, Menu, Divider } from "react-native-paper";
import { useAdminFlashcardReview } from "@hooks/useAdminFlashcardReview";
import CustomText from "@components/ui/CustomText";
import CustomButton from "@components/ui/CustomButton";
import CustomTextInput from "@components/ui/CustomTextInput";
import CustomSwitch from "@components/ui/CustomSwitch";
import LoadingIndicator from "@components/ui/LoadingIndicator";
import ErrorMessage from "@components/ui/ErrorMessage";
import { FlashcardCategory, DifficultyLevel } from "@src/types/Flashcard";

// Helper function to get enum keys for display
function getEnumKeys<T extends object>(enumObj: T): Array<keyof T> {
  return Object.keys(enumObj).filter((key) => isNaN(Number(key))) as Array<
    keyof T
  >;
}

export default function AdminFlashcardReviewScreen() {
  const theme = useTheme();
  const {
    currentFlashcardData,
    currentFlashcard,
    isLoading,
    isUpdating,
    isRegenerating,
    error,
    updateField,
    handleVerifyAndNext,
    handleSkip,
    handleRegenerateImage,
    handleRegenerateAudio,
    handleComplete,
  } = useAdminFlashcardReview();

  // State for Menu visibility
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [difficultyMenuVisible, setDifficultyMenuVisible] = useState(false);

  const openCategoryMenu = () => setCategoryMenuVisible(true);
  const closeCategoryMenu = () => setCategoryMenuVisible(false);
  const openDifficultyMenu = () => setDifficultyMenuVisible(true);
  const closeDifficultyMenu = () => setDifficultyMenuVisible(false);

  if (isLoading) {
    return <LoadingIndicator size="large" style={styles.loader} />;
  }

  if (error && !currentFlashcardData) {
    return (
      <View>
        <ErrorMessage message={`Error: ${error}`} />
        <CustomButton onPress={handleComplete} title="Back to Profile" />
      </View>
    );
  }

  if (!currentFlashcardData || !currentFlashcard) {
    return (
      <View>
        <CustomText>No flashcard to review or all reviewed.</CustomText>
        <CustomButton onPress={handleComplete} title="Back to Profile" />
      </View>
    );
  }

  // Helper to render text input
  const renderTextInput = (
    label: string,
    value: string | undefined,
    field: keyof typeof currentFlashcardData,
    multiline: boolean = false,
    keyboardType: "default" | "numeric" = "default"
  ) => (
    <CustomTextInput
      label={label}
      value={value || ""}
      onChangeText={(text) => updateField(field, text)}
      style={styles.input}
      multiline={multiline}
      keyboardType={keyboardType}
      disabled={isUpdating || isRegenerating}
    />
  );

  return (
    <ScrollView
      style={[
        styles.scrollContainer,
        { backgroundColor: theme.colors.background },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Card mode="contained" style={styles.card}>
        <Card.Title
          title={`Review Flashcard (ID: ${currentFlashcard.id.substring(
            0,
            8
          )})`}
        />
        <Card.Content>
          {error && (
            <ErrorMessage
              message={`Error: ${error}`}
              containerStyle={styles.error}
            />
          )}

          {renderTextInput(
            "Front Text (Question)",
            currentFlashcardData.frontText,
            "frontText",
            true
          )}
          {renderTextInput(
            "Back Text (Answer)",
            currentFlashcardData.backText,
            "backText",
            true
          )}
          {renderTextInput(
            "Example Sentence",
            currentFlashcardData.exampleSentence,
            "exampleSentence",
            true
          )}
          {renderTextInput(
            "Example Sentence Translation",
            currentFlashcardData.exampleSentenceTranslation,
            "exampleSentenceTranslation",
            true
          )}
          {renderTextInput(
            "Image URL",
            currentFlashcardData.imageUrl,
            "imageUrl"
          )}
          <CustomButton
            onPress={handleRegenerateImage}
            title="Regenerate Image"
            loading={isRegenerating}
            disabled={isUpdating || isRegenerating}
            style={styles.actionButton}
          />
          {renderTextInput(
            "Audio URL",
            currentFlashcardData.audioUrl,
            "audioUrl"
          )}
          <CustomButton
            onPress={handleRegenerateAudio}
            title="Regenerate Audio"
            loading={isRegenerating}
            disabled={isUpdating || isRegenerating}
            style={styles.actionButton}
          />
          {renderTextInput("Notes", currentFlashcardData.notes, "notes", true)}

          {/* Category Selector using Menu */}
          <Menu
            visible={categoryMenuVisible}
            onDismiss={closeCategoryMenu}
            anchor={
              <CustomButton
                onPress={openCategoryMenu}
                title={`Category: ${
                  FlashcardCategory[currentFlashcardData.categories?.[0]] ||
                  "Select"
                }`}
                mode="outlined"
                style={styles.input}
                disabled={isUpdating || isRegenerating}
              />
            }
          >
            {getEnumKeys(FlashcardCategory)
              .filter((key) => key !== "AllCategories")
              .map((key) => (
                <Menu.Item
                  key={key}
                  onPress={() => {
                    updateField("categories", [FlashcardCategory[key]]);
                    closeCategoryMenu();
                  }}
                  title={key}
                />
              ))}
          </Menu>

          {/* Difficulty Selector using Menu */}
          <Menu
            visible={difficultyMenuVisible}
            onDismiss={closeDifficultyMenu}
            anchor={
              <CustomButton
                onPress={openDifficultyMenu}
                title={`Difficulty: ${
                  DifficultyLevel[currentFlashcardData.difficulty]
                }`}
                mode="outlined"
                style={styles.input}
                disabled={isUpdating || isRegenerating}
              />
            }
          >
            {getEnumKeys(DifficultyLevel).map((key) => (
              <Menu.Item
                key={key}
                onPress={() => {
                  updateField("difficulty", DifficultyLevel[key]);
                  closeDifficultyMenu();
                }}
                title={key}
              />
            ))}
          </Menu>

          {/* Verified Switch */}
          <CustomSwitch
            label="Verified:"
            value={currentFlashcardData.isVerified}
            onValueChange={(value) => updateField("isVerified", value)}
            style={styles.switchContainer}
          />
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <CustomButton
            onPress={handleSkip}
            title="Skip"
            disabled={isUpdating || isRegenerating}
            style={styles.controlButton}
          />
          <CustomButton
            onPress={handleVerifyAndNext}
            title="Verify & Next"
            loading={isUpdating}
            disabled={isUpdating || isRegenerating}
            mode="contained"
            style={styles.controlButton}
          />
        </Card.Actions>
      </Card>
      <CustomButton
        onPress={handleComplete}
        title="Complete Review Session"
        style={styles.completeButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  input: {
    marginBottom: 12,
  },
  error: {
    marginBottom: 10,
  },
  actionButton: {
    marginTop: 4,
    marginBottom: 12,
  },
  switchContainer: {
    marginVertical: 12,
  },
  cardActions: {
    justifyContent: "space-around",
    paddingBottom: 8,
  },
  controlButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  completeButton: {
    marginTop: 16,
  },
});
