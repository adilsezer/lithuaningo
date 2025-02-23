import React, { useState } from "react";
import { View, StyleSheet, Button } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { flashcardFormSchema } from "@utils/zodSchemas";
import { FlashcardFormData, MediaFile } from "@src/types";
import { useFlashcards } from "@hooks/useFlashcards";
import { useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import BackButton from "@components/ui/BackButton";
import CustomButton from "@components/ui/CustomButton";
import CustomAudioPicker from "@components/ui/CustomAudioPicker";
import { CustomImagePicker } from "@components/ui/CustomImagePicker";
import CustomTextInput from "@components/ui/CustomTextInput";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";

const flashcardFields: FormField[] = [
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
];

export default function CreateFlashcardScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { createFlashcard } = useFlashcards();
  const [imageFile, setImageFile] = useState<MediaFile>();
  const [audioFile, setAudioFile] = useState<MediaFile>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FlashcardFormData>({
    resolver: zodResolver(flashcardFormSchema),
    defaultValues: {
      frontWord: "",
      backWord: "",
      exampleSentence: "",
      exampleSentenceTranslation: "",
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      const response = await fetch(uri);
      const blob = await response.blob();
      const file: MediaFile = {
        uri,
        type: "image/jpeg",
        name: "image.jpg",
        size: blob.size,
      };
      setImageFile(file);
    }
  };

  const pickAudio = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        console.error("Audio permission not granted");
        return;
      }

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();

      // Record for 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000));

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        const response = await fetch(uri);
        const blob = await response.blob();
        const file: MediaFile = {
          uri,
          type: "audio/m4a",
          name: "audio.m4a",
          size: blob.size,
        };
        setAudioFile(file);
      }
    } catch (error) {
      console.error("Error recording audio:", error);
    }
  };

  const onSubmit = async (data: FlashcardFormData) => {
    if (!deckId) return;

    try {
      await createFlashcard(
        {
          deckId,
          ...data,
        },
        imageFile,
        audioFile
      );
      router.back();
    } catch (error) {
      console.error("Error creating flashcard:", error);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen
        options={{
          title: "Create Flashcard",
          headerLeft: () => <BackButton />,
        }}
      />

      <CustomText variant="titleLarge" style={styles.title}>
        Create New Flashcard
      </CustomText>

      <Form
        fields={flashcardFields}
        onSubmit={onSubmit}
        submitButtonText="Create Flashcard"
        zodSchema={flashcardFormSchema}
      />

      <View style={styles.mediaButtons}>
        <View style={styles.mediaButton}>
          <CustomImagePicker
            value={imageFile || null}
            onChange={(file) => setImageFile(file || undefined)}
          />
        </View>
        <View style={styles.mediaButton}>
          <CustomAudioPicker
            value={audioFile || null}
            onChange={(file) => setAudioFile(file || undefined)}
          />
        </View>
      </View>

      <CustomButton title="Create Flashcard" onPress={handleSubmit(onSubmit)} />
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
  input: {
    marginBottom: 16,
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
