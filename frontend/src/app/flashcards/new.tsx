import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAlertDialog } from "@components/ui/AlertDialog";
import type { FlashcardFormData } from "@src/types";
import BackButton from "@components/layout/BackButton";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";
import { useUserData } from "@stores/useUserStore";
import CustomButton from "@components/ui/CustomButton";
import { useFlashcards } from "@hooks/useFlashcards";
import { flashcardFormSchema } from "@utils/zodSchemas";
import { useTheme } from "react-native-paper";
import CustomText from "@components/typography/CustomText";

export default function NewFlashcardScreen() {
  const router = useRouter();
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const theme = useTheme();
  const alertDialog = useAlertDialog();
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
      alertDialog.error("Missing required data");
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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <BackButton />
      <ScrollView contentContainerStyle={styles.container}>
        <CustomText>Create New Flashcard</CustomText>
        <Form
          fields={fields}
          onSubmit={handleSubmit}
          submitButtonText="Create Flashcard"
          zodSchema={flashcardFormSchema}
        />
        <CustomButton
          title="Complete Deck"
          onPress={() => router.push(`/decks/${deckId}`)}
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
