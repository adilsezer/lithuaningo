import React, { useState } from "react";
import { View, StyleSheet, Button } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { flashcardFormSchema } from "@utils/zodSchemas";
import { FlashcardFormData } from "@src/types";
import { useFlashcards } from "@hooks/useFlashcards";
import { useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import BackButton from "@components/layout/BackButton";
import CustomButton from "@components/ui/CustomButton";
import CustomAudioPicker from "@components/ui/CustomAudioPicker";
import { CustomImagePicker } from "@components/ui/CustomImagePicker";
import CustomTextInput from "@components/ui/CustomTextInput";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";

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

export default function CreateFlashcardScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { createFlashcard } = useFlashcards();
  const [imageFile, setImageFile] = useState<File>();
  const [audioFile, setAudioFile] = useState<File>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FlashcardFormData>({
    resolver: zodResolver(flashcardFormSchema),
    defaultValues: {
      frontText: "",
      backText: "",
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
      const file = new File([blob], "image.jpg", { type: "image/jpeg" });
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
        const file = new File([blob], "audio.m4a", { type: "audio/m4a" });
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
            value={
              imageFile
                ? {
                    uri: URL.createObjectURL(imageFile),
                    type: imageFile.type,
                    name: imageFile.name,
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
