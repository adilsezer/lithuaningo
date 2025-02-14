import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAlertDialog } from "@hooks/useAlertDialog";
import type { FlashcardFormData } from "@src/types";
import BackButton from "@components/layout/BackButton";
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
  const { showError } = useAlertDialog();
  const { createFlashcard } = useFlashcards();

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
  ];

  const handleSubmit = async (formData: FlashcardFormData) => {
    if (!deckId) {
      showError("Missing deck ID");
      return;
    }

    const success = await createFlashcard({
      ...formData,
      deckId,
    });

    if (success) {
      router.push(`/decks/${deckId}`);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <BackButton />
      <ScrollView contentContainerStyle={styles.container}>
        <CustomText variant="titleLarge" style={styles.title}>
          Create New Flashcard
        </CustomText>
        <Form
          fields={fields}
          onSubmit={handleSubmit}
          submitButtonText="Create Flashcard"
          zodSchema={flashcardFormSchema}
        />
        <CustomButton
          title="Back to Deck"
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
  title: {
    marginBottom: 24,
  },
});
