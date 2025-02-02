import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAlertDialog } from "@hooks/useAlertDialog";
import type { Flashcard, FlashcardFormData } from "@src/types";
import BackButton from "@components/layout/BackButton";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";
import { useUserData } from "@stores/useUserStore";
import { flashcardEditSchema } from "@utils/zodSchemas";
import { useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import flashcardService from "@services/data/flashcardService";
import { useSetLoading } from "@stores/useUIStore";
import AudioControl from "@components/ui/AudioControl";

export default function EditFlashcardScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { showError, showSuccess } = useAlertDialog();
  const userData = useUserData();
  const setLoading = useSetLoading();
  const [flashcard, setFlashcard] = useState<Flashcard | null>(null);

  useEffect(() => {
    const fetchFlashcard = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await flashcardService.getFlashcardById(id);
        setFlashcard(data);
      } catch (error) {
        console.error("Error fetching flashcard:", error);
        showError("Failed to load flashcard");
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcard();
  }, [id, setLoading, showError]);

  const fields: FormField[] = [
    {
      name: "front",
      label: "Front Side",
      category: "text-input",
      type: "text",
      placeholder: "Enter front side text",
      defaultValue: flashcard?.front || "",
    },
    {
      name: "back",
      label: "Back Side",
      category: "text-input",
      type: "text",
      placeholder: "Enter back side text",
      defaultValue: flashcard?.back || "",
    },
    {
      name: "exampleSentence",
      label: "Example Sentence",
      category: "text-input",
      type: "text",
      placeholder: "Enter an example sentence (optional)",
      defaultValue: flashcard?.exampleSentence || "",
    },
    {
      name: "audioFile",
      label: "Audio",
      category: "audio-input",
      type: "audio",
      defaultValue: flashcard?.audioUrl
        ? {
            uri: flashcard.audioUrl,
            type: "audio/mp4",
            name: "current-audio.mp4",
          }
        : null,
    },
    {
      name: "imageFile",
      label: "Image",
      category: "image-input",
      type: "image",
      defaultValue: flashcard?.imageUrl
        ? {
            uri: flashcard.imageUrl,
            type: "image/jpeg",
            name: "current-image.jpg",
          }
        : null,
    },
  ];

  const handleSubmit = async (formData: Partial<FlashcardFormData>) => {
    if (!id || !userData?.id || !flashcard) {
      showError("Missing required data");
      return;
    }

    try {
      setLoading(true);

      // Handle file uploads if new files are selected
      const [imageUrl, audioUrl] = await Promise.all([
        formData.imageFile &&
        "uri" in formData.imageFile &&
        formData.imageFile.uri !== flashcard.imageUrl
          ? flashcardService.uploadFile(formData.imageFile)
          : Promise.resolve(flashcard.imageUrl),
        formData.audioFile &&
        "uri" in formData.audioFile &&
        formData.audioFile.uri !== flashcard.audioUrl
          ? flashcardService.uploadFile(formData.audioFile)
          : Promise.resolve(flashcard.audioUrl),
      ]);

      // Update flashcard with new data
      await flashcardService.updateFlashcard(id, {
        ...flashcard,
        front: formData.front || flashcard.front,
        back: formData.back || flashcard.back,
        exampleSentence: formData.exampleSentence,
        imageUrl,
        audioUrl,
      });

      showSuccess("Flashcard updated successfully");
      router.back();
    } catch (error) {
      console.error("Error updating flashcard:", error);
      showError("Failed to update flashcard");
    } finally {
      setLoading(false);
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
