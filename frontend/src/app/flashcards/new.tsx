import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { AlertDialog } from "@components/ui/AlertDialog";
import type { FlashcardFormData } from "@src/types";
import BackButton from "@components/layout/BackButton";
import { Form } from "@components/form/Form";
import { SectionTitle } from "@components/typography";
import { FormField } from "@components/form/form.types";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import CustomButton from "@components/ui/CustomButton";
import { useFlashcards } from "@hooks/useFlashcards";

export default function NewFlashcardScreen() {
  const router = useRouter();
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const { colors } = useThemeStyles();
  const userData = useAppSelector(selectUserData);
  const { handleCreateFlashcard } = useFlashcards();

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
      name: "audioFile",
      label: "Audio",
      category: "audio-input",
      type: "audio",
      validation: {
        validate: (value: File | undefined) => {
          if (!value) return true;
          return (
            value.type.startsWith("audio/") || "Please upload an audio file"
          );
        },
      },
    },
    {
      name: "imageFile",
      label: "Image",
      category: "image-input",
      type: "image",
      validation: {
        validate: (value: File | undefined) => {
          if (!value) return true;
          return (
            value.type.startsWith("image/") || "Please upload an image file"
          );
        },
      },
    },
  ];

  const handleSubmit = async (data: FlashcardFormData) => {
    if (!deckId || !userData?.id) {
      AlertDialog.error("Missing required data");
      return;
    }

    const success = await handleCreateFlashcard(data, deckId, userData.id);
    if (success) {
      // Create another flashcard for the same deck
      router.push(`/flashcards/new?deckId=${deckId}`);
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
