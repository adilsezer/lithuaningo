import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useFlashcards } from "@hooks/useFlashcards";
import { useTheme } from "react-native-paper";
import { Flashcard, FlashcardFormData } from "@src/types";
import { flashcardEditSchema } from "@utils/zodSchemas";
import CustomText from "@components/ui/CustomText";
import BackButton from "@components/layout/BackButton";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";
import { CustomImagePicker } from "@components/ui/CustomImagePicker";
import CustomAudioPicker from "@components/ui/CustomAudioPicker";

const flashcardFields: FormField[] = [
  {
    name: "frontText",
    label: "Front Text",
    category: "text-input",
    type: "text",
    placeholder: "Enter front text",
  },
  {
    name: "backText",
    label: "Back Text",
    category: "text-input",
    type: "text",
    placeholder: "Enter back text",
  },
];

export default function EditFlashcardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { updateFlashcard, getFlashcardById } = useFlashcards();
  const [flashcard, setFlashcard] = useState<Flashcard | null>(null);
  const [imageFile, setImageFile] = useState<File>();
  const [audioFile, setAudioFile] = useState<File>();

  useEffect(() => {
    const loadFlashcard = async () => {
      if (!id) return;
      try {
        const data = await getFlashcardById(id);
        setFlashcard(data);
      } catch (error) {
        console.error("Error loading flashcard:", error);
      }
    };

    loadFlashcard();
  }, [id, getFlashcardById]);

  const onSubmit = async (data: FlashcardFormData) => {
    if (!id || !flashcard) return;

    try {
      await updateFlashcard(
        id,
        data,
        imageFile,
        audioFile,
        flashcard.imageUrl,
        flashcard.audioUrl
      );
      router.back();
    } catch (error) {
      console.error("Error updating flashcard:", error);
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
      <Stack.Screen
        options={{
          title: "Edit Flashcard",
          headerLeft: () => <BackButton />,
        }}
      />

      <CustomText variant="titleLarge" style={styles.title}>
        Edit Flashcard
      </CustomText>

      <Form
        fields={flashcardFields}
        onSubmit={onSubmit}
        submitButtonText="Update Flashcard"
        zodSchema={flashcardEditSchema}
        defaultValues={{
          frontText: flashcard.frontText,
          backText: flashcard.backText,
        }}
      />

      <View style={styles.mediaButtons}>
        <View style={styles.mediaButton}>
          <CustomImagePicker
            value={
              imageFile
                ? {
                    uri: URL.createObjectURL(imageFile),
                    type: imageFile.type,
                    name: imageFile.name,
                  }
                : flashcard.imageUrl
                ? {
                    uri: flashcard.imageUrl,
                    type: "image/jpeg",
                    name: "current-image.jpg",
                  }
                : null
            }
            onChange={async (file) => {
              if (file) {
                const response = await fetch(file.uri);
                const blob = await response.blob();
                setImageFile(new File([blob], file.name, { type: file.type }));
              } else {
                setImageFile(undefined);
              }
            }}
          />
        </View>
        <View style={styles.mediaButton}>
          <CustomAudioPicker
            value={
              audioFile
                ? {
                    uri: URL.createObjectURL(audioFile),
                    type: audioFile.type,
                    name: audioFile.name,
                  }
                : flashcard.audioUrl
                ? {
                    uri: flashcard.audioUrl,
                    type: "audio/m4a",
                    name: "current-audio.m4a",
                  }
                : null
            }
            onChange={async (file) => {
              if (file) {
                const response = await fetch(file.uri);
                const blob = await response.blob();
                setAudioFile(new File([blob], file.name, { type: file.type }));
              } else {
                setAudioFile(undefined);
              }
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: "center",
  },
  mediaButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  mediaButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});
