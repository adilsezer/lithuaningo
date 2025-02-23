import React, { useRef } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAlertDialog } from "@hooks/useAlertDialog";
import type { FlashcardFormData } from "@src/types";
import BackButton from "@components/ui/BackButton";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";
import CustomButton from "@components/ui/CustomButton";
import { useFlashcards } from "@hooks/useFlashcards";
import { flashcardFormSchema } from "@utils/zodSchemas";
import { useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";

export default function NewFlashcardScreen() {
  const router = useRouter();
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const theme = useTheme();
  const { showError, showSuccess } = useAlertDialog();
  const { createFlashcard } = useFlashcards();
  const formRef = useRef<{ reset: () => void }>(null);

  const fields: FormField[] = [
    {
      name: "frontWord",
      label: "Front Word",
      category: "text-input",
      type: "text",
      placeholder: "Enter front word",
    },
    {
      name: "backWord",
      label: "Back Word",
      category: "text-input",
      type: "text",
      placeholder: "Enter back word",
    },
    {
      name: "exampleSentence",
      label: "Example Sentence",
      category: "text-input",
      type: "text",
      placeholder: "Enter an example sentence",
    },
    {
      name: "exampleSentenceTranslation",
      label: "Example Sentence Translation",
      category: "text-input",
      type: "text",
      placeholder: "Enter the sentence translation",
    },
    {
      name: "imageFile",
      label: "Flashcard Image",
      category: "image-input",
      type: "image",
      maxSize: 5 * 1024 * 1024, // 5MB
      placeholderText: "Tap to add an flashcard image (optional)",
    },
    {
      name: "audioFile",
      label: "Flashcard Audio",
      category: "audio-input",
      type: "audio",
      maxSize: 10 * 1024 * 1024, // 10MB
      maxDuration: 30, // 30 seconds
      placeholderText: "Tap to add an flashcard audio (optional)",
    },
  ];

  const handleSubmit = async (formData: FlashcardFormData) => {
    if (!deckId) {
      showError("Missing deck ID");
      return;
    }

    try {
      const success = await createFlashcard(
        {
          ...formData,
          deckId,
        },
        formData.imageFile,
        formData.audioFile
      );

      if (success) {
        showSuccess("Flashcard created successfully");
        formRef.current?.reset();
      }
    } catch (error) {
      console.error("Failed to create flashcard:", error);
      showError("Failed to create flashcard. Please try again.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <BackButton />
      <ScrollView contentContainerStyle={styles.container}>
        <CustomText variant="titleLarge" bold>
          Create New Flashcard
        </CustomText>
        <Form
          ref={formRef}
          fields={fields}
          onSubmit={handleSubmit}
          submitButtonText="Create Flashcard"
          zodSchema={flashcardFormSchema}
        />
        <CustomButton
          title="Go to Deck"
          onPress={() => router.push(`/decks/${deckId}`)}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
});
