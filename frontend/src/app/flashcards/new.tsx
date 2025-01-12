import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { AlertDialog } from "@components/ui/AlertDialog";
import type { FlashcardFormData } from "@src/types";
import flashcardService from "@services/data/flashcardService";
import BackButton from "@components/layout/BackButton";
import { Form } from "@components/form/Form";
import { SectionTitle } from "@components/typography";
import { FormField } from "@components/form/form.types";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import CustomButton from "@components/ui/CustomButton";

export default function NewFlashcardScreen() {
  const router = useRouter();
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const { colors } = useThemeStyles();
  const userData = useAppSelector(selectUserData);

  const fields: FormField[] = [
    {
      name: "front",
      label: "Front Side",
      category: "text-input",
      type: "text",
      placeholder: "Enter front side text",
      validation: {
        required: true,
        message: "Front side is required",
      },
    },
    {
      name: "back",
      label: "Back Side",
      category: "text-input",
      type: "text",
      placeholder: "Enter back side text",
      validation: {
        required: true,
        message: "Back side is required",
      },
    },
    {
      name: "exampleSentence",
      label: "Example Sentence",
      category: "text-input",
      type: "text",
      placeholder: "Enter an example sentence (optional)",
    },
    {
      name: "audioUrl",
      label: "Audio",
      category: "audio-input",
      type: "audio",
    },
    {
      name: "imageUrl",
      label: "Image",
      category: "image-input",
      type: "image",
    },
  ];

  const handleSubmit = async (data: FlashcardFormData) => {
    try {
      if (!deckId || !userData?.id) {
        AlertDialog.error("Missing required data");
        return;
      }

      const { imageFile, audioFile, ...flashcardData } = data;

      await flashcardService.createFlashcard(
        {
          ...flashcardData,
          deckId,
          createdBy: userData.id,
        },
        imageFile,
        audioFile
      );
      AlertDialog.success("Flashcard created successfully");

      // Create another flashcard for the same deck
      router.push(`/flashcards/new?deckId=${deckId}`);
    } catch (error) {
      AlertDialog.error("Failed to create flashcard");
      console.error("Error creating flashcard:", error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <BackButton />
      <ScrollView contentContainerStyle={styles.container}>
        <SectionTitle>Create New Flashcard</SectionTitle>
        <Form
          fields={fields}
          onSubmit={handleSubmit}
          submitButtonText="Create Flashcard"
        />
        <CustomButton
          title="Complete Deck"
          onPress={() => router.push(`/decks/${deckId}`)}
          style={{ marginTop: 12 }}
          variant="secondary"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
