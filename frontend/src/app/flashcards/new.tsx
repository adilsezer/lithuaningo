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
import { useUserData } from "@stores/useUserStore";
import CustomButton from "@components/ui/CustomButton";
import { useFlashcards } from "@hooks/useFlashcards";
import { flashcardFormSchema } from "@utils/zodSchemas";

export default function NewFlashcardScreen() {
  const router = useRouter();
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const { colors } = useThemeStyles();
  const userData = useUserData();
  const { handleCreateFlashcard } = useFlashcards();

  const fields: FormField[] = [
    {
      name: "front",
      label: "Front Side",
      category: "text-input",
      type: "text",
      placeholder: "Enter front side text",
    },
    {
      name: "back",
      label: "Back Side",
      category: "text-input",
      type: "text",
      placeholder: "Enter back side text",
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
    },
    {
      name: "imageFile",
      label: "Image",
      category: "image-input",
      type: "image",
    },
  ];

  const handleSubmit = async (
    formData: Omit<FlashcardFormData, "deckId" | "createdBy">
  ) => {
    if (!deckId || !userData?.id) {
      AlertDialog.error("Missing required data");
      return;
    }

    const flashcardData = {
      ...formData,
      deckId,
      createdBy: userData.id,
    };

    const success = await handleCreateFlashcard(
      flashcardData,
      deckId,
      userData.id
    );
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
          zodSchema={flashcardFormSchema}
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
