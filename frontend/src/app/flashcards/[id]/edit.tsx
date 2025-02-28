import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAlertDialog } from "@hooks/useAlertDialog";
import { useFlashcards } from "@hooks/useFlashcards";
import { useDecks } from "@hooks/useDecks";
import { useUserData } from "@stores/useUserStore";
import { useTheme, ActivityIndicator } from "react-native-paper";
import { Flashcard, FlashcardFormData } from "@src/types";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";
import { flashcardEditSchema } from "@utils/zodSchemas";
import BackButton from "@components/ui/BackButton";
import CustomText from "@components/ui/CustomText";

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
    placeholder: "Enter example sentence",
  },
  {
    name: "exampleSentenceTranslation",
    label: "Example Sentence Translation",
    category: "text-input",
    type: "text",
    placeholder: "Enter sentence translation",
  },
  {
    name: "imageFile",
    label: "Flashcard Image",
    category: "image-input",
    type: "image",
    maxSize: 5 * 1024 * 1024,
    placeholderText: "Tap to change flashcard image",
  },
  {
    name: "audioFile",
    label: "Flashcard Audio",
    category: "audio-input",
    type: "audio",
    maxSize: 10 * 1024 * 1024,
    maxDuration: 30,
    placeholderText: "Tap to change flashcard audio",
  },
];

export default function EditFlashcardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { updateFlashcard, getFlashcardById } = useFlashcards();
  const { getDeckById } = useDecks();
  const userData = useUserData();
  const { showError, showSuccess } = useAlertDialog();
  const [flashcard, setFlashcard] = useState<Flashcard | null>(null);

  useEffect(() => {
    const loadFlashcardAndCheckAuth = async () => {
      if (!id) return;
      try {
        const flashcardData = await getFlashcardById(id);
        setFlashcard(flashcardData);

        const deckData = await getDeckById(flashcardData.deckId);

        if (
          deckData &&
          userData?.id !== deckData.userId &&
          !userData?.isAdmin
        ) {
          showError("You are not authorized to edit this flashcard");
          router.back();
          return;
        }
      } catch (error) {
        console.error("Error loading flashcard:", error);
        showError("Failed to load flashcard");
      }
    };

    loadFlashcardAndCheckAuth();
  }, [id, getFlashcardById, getDeckById, userData, router, showError]);

  const handleSubmit = async (formData: FlashcardFormData) => {
    if (!id || !flashcard) {
      showError("Missing required data");
      return;
    }

    try {
      const success = await updateFlashcard(
        id,
        formData,
        formData.imageFile,
        formData.audioFile,
        flashcard.imageUrl,
        flashcard.audioUrl
      );

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
        <View style={styles.header}>
          <BackButton />
          <CustomText variant="titleMedium">Edit Flashcard</CustomText>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <BackButton />
        <CustomText variant="titleMedium">Edit Flashcard</CustomText>
        <View style={styles.headerRight} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Form
          fields={fields}
          onSubmit={handleSubmit}
          submitButtonText="Update Flashcard"
          zodSchema={flashcardEditSchema}
          defaultValues={{
            frontWord: flashcard.frontWord,
            backWord: flashcard.backWord,
            exampleSentence: flashcard.exampleSentence,
            exampleSentenceTranslation: flashcard.exampleSentenceTranslation,
            imageFile: flashcard.imageUrl
              ? {
                  uri: flashcard.imageUrl,
                  type: "image/jpeg",
                  name: "current-image.jpg",
                }
              : undefined,
            audioFile: flashcard.audioUrl
              ? {
                  uri: flashcard.audioUrl,
                  type: "audio/m4a",
                  name: "current-audio.m4a",
                }
              : undefined,
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  headerRight: {
    width: 40, // Same width as BackButton for alignment
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
