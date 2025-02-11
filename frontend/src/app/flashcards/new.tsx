import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAlertDialog } from "@hooks/useAlertDialog";
import type { Flashcard } from "@src/types";
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
      name: "frontText",
      label: "Front Side",
      category: "text-input",
      type: "text",
      placeholder: "Enter front side text",
    },
    {
      name: "backText",
      label: "Back Side",
      category: "text-input",
      type: "text",
      placeholder: "Enter back side text",
    },
  ];

  const handleSubmit = async (
    formData: Pick<Flashcard, "frontText" | "backText">
  ) => {
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
