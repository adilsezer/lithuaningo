import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "react-native-paper";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";
import { Flashcard, FlashcardFormData } from "@src/types";
import { useFlashcards } from "@hooks/useFlashcards";
import BackButton from "@components/ui/BackButton";
import { ActivityIndicator } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import { flashcardFormSchema } from "@utils/zodSchemas";

// Form fields definition
const fields: FormField[] = [
  {
    name: "frontWord",
    label: "Front Word",
    category: "text-input",
    type: "text",
    placeholder: "Enter the word in Lithuanian",
  },
  {
    name: "backWord",
    label: "Back Word",
    category: "text-input",
    type: "text",
    placeholder: "Enter the translation",
  },
  {
    name: "exampleSentence",
    label: "Example Sentence",
    category: "text-input",
    type: "text",
    multiline: true,
    numberOfLines: 2,
    placeholder: "Enter an example sentence in Lithuanian",
  },
  {
    name: "exampleSentenceTranslation",
    label: "Example Sentence Translation",
    category: "text-input",
    type: "text",
    multiline: true,
    numberOfLines: 2,
    placeholder: "Enter the translation of the example sentence",
  },
  {
    name: "level",
    label: "Language Level",
    category: "selection",
    type: "picker",
    placeholder: "Select language level",
    options: [
      { label: "A1 - Beginner", value: "A1" },
      { label: "A2 - Elementary", value: "A2" },
      { label: "B1 - Intermediate", value: "B1" },
      { label: "B2 - Upper Intermediate", value: "B2" },
      { label: "C1 - Advanced", value: "C1" },
      { label: "C2 - Proficient", value: "C2" },
    ],
  },
  {
    name: "notes",
    label: "Notes",
    category: "text-input",
    type: "text",
    multiline: true,
    numberOfLines: 3,
    placeholder: "Add any additional notes (optional)",
  },
  {
    name: "imageFile",
    label: "Image",
    category: "image-input",
    type: "image",
    maxSize: 5 * 1024 * 1024,
    placeholderText: "Tap to add an image",
  },
  {
    name: "audioFile",
    label: "Audio",
    category: "audio-input",
    type: "audio",
    maxSize: 10 * 1024 * 1024,
    placeholderText: "Tap to add audio pronunciation",
  },
];

export default function EditFlashcardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flashcard, setFlashcard] = useState<Flashcard | null>(null);

  const { updateFlashcard, getFlashcardById, isLoading } = useFlashcards();

  useEffect(() => {
    if (id) {
      loadFlashcard();
    }
  }, [id]);

  const loadFlashcard = async () => {
    try {
      const data = await getFlashcardById(id);
      setFlashcard(data);
    } catch (error) {
      console.error("Error loading flashcard:", error);
    }
  };

  const handleSubmit = async (data: FlashcardFormData) => {
    if (!id || !flashcard) {
      console.error("Flashcard ID or data is missing");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateFlashcard(
        id,
        {
          frontWord: data.frontWord,
          backWord: data.backWord,
          exampleSentence: data.exampleSentence,
          exampleSentenceTranslation: data.exampleSentenceTranslation,
          level: data.level,
          notes: data.notes,
        },
        data.imageFile || undefined,
        data.audioFile || undefined,
        flashcard.imageUrl,
        flashcard.audioUrl
      );

      // Navigate back to the deck edit screen
      router.push(`/decks/${flashcard.deckId}/edit`);
    } catch (error) {
      console.error("Error updating flashcard:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !flashcard) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <BackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <CustomText style={{ marginTop: 16 }}>
            Loading flashcard...
          </CustomText>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <BackButton />
      <ScrollView style={styles.scrollView}>
        <CustomText variant="titleLarge" bold style={styles.title}>
          Edit Flashcard
        </CustomText>

        <Form
          fields={fields}
          onSubmit={handleSubmit}
          submitButtonText="Update Flashcard"
          zodSchema={flashcardFormSchema}
          isLoading={isSubmitting}
          defaultValues={{
            frontWord: flashcard.frontWord,
            backWord: flashcard.backWord,
            exampleSentence: flashcard.exampleSentence,
            exampleSentenceTranslation: flashcard.exampleSentenceTranslation,
            notes: flashcard.notes || "",
            level: flashcard.level || "",
            imageFile: flashcard.imageUrl
              ? {
                  uri: flashcard.imageUrl,
                  type: "image/jpeg",
                  name: flashcard.imageUrl.split("/").pop() || "image.jpg",
                }
              : null,
            audioFile: flashcard.audioUrl
              ? {
                  uri: flashcard.audioUrl,
                  type: "audio/mpeg",
                  name: flashcard.audioUrl.split("/").pop() || "audio.mp3",
                }
              : null,
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    marginBottom: 16,
    textAlign: "left",
  },
});
