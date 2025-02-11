import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAlertDialog } from "@hooks/useAlertDialog";
import type { Flashcard } from "@src/types";
import BackButton from "@components/layout/BackButton";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";
import { flashcardEditSchema } from "@utils/zodSchemas";
import { useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import { useFlashcards } from "@hooks/useFlashcards";
import flashcardService from "@services/data/flashcardService";

export default function EditFlashcardScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { showError, showSuccess } = useAlertDialog();
  const { updateFlashcard } = useFlashcards();
  const [flashcard, setFlashcard] = useState<Flashcard | null>(null);

  useEffect(() => {
    const fetchFlashcard = async () => {
      if (!id) return;

      try {
        const data = await flashcardService.getFlashcardById(id);
        setFlashcard(data);
      } catch (error) {
        console.error("Error fetching flashcard:", error);
        showError("Failed to load flashcard");
      }
    };

    fetchFlashcard();
  }, [id, showError]);

  const fields: FormField[] = [
    {
      name: "frontText",
      label: "Front Side",
      category: "text-input",
      type: "text",
      placeholder: "Enter front side text",
      defaultValue: flashcard?.frontText || "",
    },
    {
      name: "backText",
      label: "Back Side",
      category: "text-input",
      type: "text",
      placeholder: "Enter back side text",
      defaultValue: flashcard?.backText || "",
    },
  ];

  const handleSubmit = async (
    formData: Pick<Flashcard, "frontText" | "backText">
  ) => {
    if (!id || !flashcard) {
      showError("Missing required data");
      return;
    }

    try {
      const success = await updateFlashcard(id, formData);
      if (success) {
        showSuccess("Flashcard updated successfully");
        router.back();
      }
    } catch (error) {
      console.error("Error updating flashcard:", error);
      showError("Failed to update flashcard");
    }
  };

  if (!flashcard) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <BackButton />
        <CustomText>Loading flashcard...</CustomText>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <BackButton />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomText variant="titleLarge" style={styles.title}>
          Edit Flashcard
        </CustomText>
        <Form
          fields={fields}
          onSubmit={handleSubmit}
          submitButtonText="Update Flashcard"
          zodSchema={flashcardEditSchema}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
  },
});
