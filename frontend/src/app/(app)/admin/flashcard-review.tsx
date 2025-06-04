import React, { useRef } from "react";
import { ScrollView, View, StyleSheet, Image } from "react-native";
import {
  Card,
  useTheme,
  Portal,
  Dialog,
  Checkbox,
  RadioButton,
} from "react-native-paper";
import { useAdminFlashcardReview } from "@hooks/useAdminFlashcardReview";
import CustomText from "@components/ui/CustomText";
import CustomButton from "@components/ui/CustomButton";
import CustomTextInput from "@components/ui/CustomTextInput";
import CustomSwitch from "@components/ui/CustomSwitch";
import LoadingIndicator from "@components/ui/LoadingIndicator";
import ErrorMessage from "@components/ui/ErrorMessage";
import AudioPlayer from "@components/ui/AudioPlayer";
import { FlashcardCategory, DifficultyLevel } from "@src/types/Flashcard";

// Helper function to get enum keys for display
function getEnumKeys<T extends object>(enumObj: T): Array<keyof T> {
  return Object.keys(enumObj).filter((key) => isNaN(Number(key))) as Array<
    keyof T
  >;
}

export default function AdminFlashcardReviewScreen() {
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null); // Create a ref for ScrollView

  // Function to scroll to top
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

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
    isCategoryDialogVisible,
    tempCategories,
    openCategoryDialog,
    closeCategoryDialog,
    handleToggleTempCategory,
    confirmCategorySelection,
    isDifficultyDialogVisible,
    tempDifficulty,
    openDifficultyDialog,
    closeDifficultyDialog,
    handleSelectTempDifficulty,
    confirmDifficultySelection,
  } = useAdminFlashcardReview(scrollToTop); // Pass scrollToTop to the hook

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
    keyboardType: "default" | "numeric" = "default",
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
      ref={scrollViewRef} // Assign ref to ScrollView
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
            8,
          )})`}
          titleStyle={{ textAlign: "center" }}
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
            true,
          )}
          {renderTextInput(
            "Back Text (Answer)",
            currentFlashcardData.backText,
            "backText",
            true,
          )}
          {renderTextInput(
            "Example Sentence",
            currentFlashcardData.exampleSentence,
            "exampleSentence",
            true,
          )}
          {renderTextInput(
            "Example Sentence Translation",
            currentFlashcardData.exampleSentenceTranslation,
            "exampleSentenceTranslation",
            true,
          )}
          {renderTextInput(
            "Image URL",
            currentFlashcardData.imageUrl,
            "imageUrl",
          )}
          {currentFlashcardData?.imageUrl ? (
            <Image
              source={{ uri: currentFlashcardData.imageUrl }}
              style={styles.imagePreview}
              resizeMode="contain"
            />
          ) : null}
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
            "audioUrl",
          )}
          {currentFlashcardData?.audioUrl ? (
            <AudioPlayer audioUrl={currentFlashcardData.audioUrl} />
          ) : null}
          <CustomButton
            onPress={handleRegenerateAudio}
            title="Regenerate Audio"
            loading={isRegenerating}
            disabled={isUpdating || isRegenerating}
            style={styles.actionButton}
          />
          {renderTextInput("Notes", currentFlashcardData.notes, "notes", true)}

          {/* Category Selector - Now a Button to open Dialog */}
          <CustomButton
            onPress={openCategoryDialog}
            title={
              currentFlashcardData?.categories &&
              currentFlashcardData.categories.length > 0
                ? `Categories: ${currentFlashcardData.categories
                    .map((cat) => FlashcardCategory[cat])
                    .join(", ")}`
                : "Select Categories"
            }
            mode="outlined"
            style={styles.input}
            disabled={isUpdating || isRegenerating}
          />

          {/* Category Selection Dialog */}
          <Portal>
            <Dialog
              visible={isCategoryDialogVisible}
              onDismiss={closeCategoryDialog}
              style={{ backgroundColor: theme.colors.background }}
            >
              <Dialog.Title>Select Categories</Dialog.Title>
              <Dialog.Content>
                <ScrollView style={{ maxHeight: 300 }}>
                  {getEnumKeys(FlashcardCategory)
                    .filter((key) => key !== "AllCategories")
                    .map((key) => {
                      const categoryValue = FlashcardCategory[key];
                      const isSelected =
                        tempCategories?.includes(categoryValue);
                      return (
                        <Checkbox.Item
                          key={key}
                          label={key}
                          status={isSelected ? "checked" : "unchecked"}
                          onPress={() =>
                            handleToggleTempCategory(categoryValue)
                          }
                          color={theme.colors.primary}
                        />
                      );
                    })}
                </ScrollView>
              </Dialog.Content>
              <Dialog.Actions>
                <CustomButton onPress={closeCategoryDialog} title="Cancel" />
                <CustomButton
                  onPress={confirmCategorySelection}
                  title="Done"
                  mode="contained"
                />
              </Dialog.Actions>
            </Dialog>
          </Portal>

          {/* Difficulty Selector - Now a Button to open Dialog */}
          <CustomButton
            onPress={openDifficultyDialog}
            title={`Difficulty: ${
              currentFlashcardData
                ? DifficultyLevel[currentFlashcardData.difficulty]
                : "Select"
            }`}
            mode="outlined"
            style={styles.input}
            disabled={isUpdating || isRegenerating}
          />

          {/* Difficulty Selection Dialog */}
          <Portal>
            <Dialog
              visible={isDifficultyDialogVisible}
              onDismiss={closeDifficultyDialog}
              style={{ backgroundColor: theme.colors.background }}
            >
              <Dialog.Title>Select Difficulty</Dialog.Title>
              <Dialog.Content>
                <RadioButton.Group
                  onValueChange={(value) =>
                    handleSelectTempDifficulty(Number(value) as DifficultyLevel)
                  }
                  value={tempDifficulty?.toString() ?? ""}
                >
                  {getEnumKeys(DifficultyLevel).map((key) => (
                    <RadioButton.Item
                      key={key}
                      label={key}
                      value={DifficultyLevel[key].toString()}
                      color={theme.colors.primary}
                    />
                  ))}
                </RadioButton.Group>
              </Dialog.Content>
              <Dialog.Actions>
                <CustomButton onPress={closeDifficultyDialog} title="Cancel" />
                <CustomButton
                  onPress={confirmDifficultySelection}
                  title="Done"
                  mode="contained"
                />
              </Dialog.Actions>
            </Dialog>
          </Portal>

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
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    marginTop: 4,
    backgroundColor: "#e0e0e0", // Placeholder background
  },
});
