import React from "react";
import { View, StyleSheet } from "react-native";
import { FlashcardForm } from "@components/flashcard/FlashcardForm";
import { useRouter } from "expo-router";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { AlertDialog } from "@components/ui/AlertDialog";
import type { Flashcard } from "@src/types";
import { useFlashcards } from "@hooks/useFlashcards";

export default function NewFlashcardScreen() {
  const router = useRouter();
  const userData = useAppSelector(selectUserData);
  const { colors } = useThemeStyles();
  const { addFlashcardToDeck } = useFlashcards();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });

  const handleSubmit = async (
    flashcard: Omit<Flashcard, "id" | "createdAt">
  ) => {
    try {
      if (!userData?.id) {
        AlertDialog.error("Please login to create flashcards");
        return;
      }

      await addFlashcardToDeck(flashcard.deckId, {
        ...flashcard,
        createdBy: userData.id,
      });
      AlertDialog.success("Flashcard created successfully");
      router.back();
    } catch (error) {
      AlertDialog.error("Failed to create flashcard");
      console.error("Error creating flashcard:", error);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <FlashcardForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        initialValues={{
          createdBy: userData?.id || "",
        }}
      />
    </View>
  );
}
