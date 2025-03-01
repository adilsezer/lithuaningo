import React, { useEffect, useState, useCallback } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAlertDialog } from "@hooks/useAlertDialog";
import { useDecks } from "@hooks/useDecks";
import { useFlashcards } from "@hooks/useFlashcards";
import { useSetLoading } from "@stores/useUIStore";
import { Deck, DeckFormData } from "@src/types";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";
import BackButton from "@components/ui/BackButton";
import CustomText from "@components/ui/CustomText";
import { FlashcardItem } from "@components/ui/FlashcardItem";
import { useTheme } from "react-native-paper";
import { deckFormSchema } from "@utils/zodSchemas";
import { DeckCategory, deckCategories } from "@src/types/DeckCategory";
import { useUserData } from "@stores/useUserStore";
import CustomButton from "@components/ui/CustomButton";

export default function EditDeckScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { showConfirm, showError } = useAlertDialog();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getDeckById, updateDeck, deleteDeck } = useDecks();
  const userData = useUserData();
  const {
    flashcards,
    getDeckFlashcards,
    deleteFlashcard,
    isLoading: flashcardsLoading,
  } = useFlashcards();
  const [deck, setDeck] = useState<Deck | null>(null);
  const setLoading = useSetLoading();

  const fields: FormField[] = [
    {
      name: "title",
      label: "Title",
      category: "text-input",
      type: "text",
      placeholder: "Enter deck title (1-100 characters)",
    },
    {
      name: "description",
      label: "Description",
      category: "text-input",
      type: "text",
      multiline: true,
      numberOfLines: 3,
      placeholder: "Enter deck description (1-1000 characters)",
    },
    {
      name: "category",
      label: "Category",
      category: "selection",
      type: "picker",
      options: deckCategories
        .filter((cat) => !["All Decks", "My Decks", "Top Rated"].includes(cat))
        .map((cat) => ({
          label: cat,
          value: cat,
        })),
    },
    {
      name: "tags",
      label: "Tags (comma separated, max 10 tags)",
      category: "text-input",
      type: "text",
      placeholder: "e.g., basics, grammar, verbs",
    },
    {
      name: "imageFile",
      label: "Deck Image",
      category: "image-input",
      type: "image",
      maxSize: 5 * 1024 * 1024,
      placeholderText: "Tap to change deck cover image",
    },
    {
      name: "isPublic",
      label: "Make deck public",
      category: "toggle",
      type: "switch",
    },
    {
      name: "consent",
      label:
        "By updating this deck, you confirm it's original, public, and compliant.",
      category: "toggle",
      type: "switch",
    },
  ];

  const fetchDeck = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const fetchedDeck = await getDeckById(id);
      setDeck(fetchedDeck);

      // Check if user is authorized to edit
      if (
        fetchedDeck &&
        userData?.id !== fetchedDeck.userId &&
        !userData?.isAdmin
      ) {
        showError("You are not authorized to edit this deck");
        router.back();
        return;
      }
    } catch (error) {
      console.error("Error fetching deck:", error);
    } finally {
      setLoading(false);
    }
  }, [id, getDeckById, setLoading, userData, router, showError]);

  useEffect(() => {
    fetchDeck();
  }, [fetchDeck]);

  useEffect(() => {
    if (id) {
      getDeckFlashcards(id);
    }
  }, [id, getDeckFlashcards]);

  const handleSubmit = async (data: DeckFormData) => {
    if (!deck || !id) return;

    try {
      await updateDeck(
        id,
        {
          ...deck,
          title: data.title,
          description: data.description,
          category: data.category,
          tags:
            data.tags
              ?.split(",")
              .map((t) => t.trim())
              .filter(Boolean) ?? [],
          isPublic: data.isPublic ?? true,
        },
        data.imageFile
      );
      router.push(`/decks/${id}`);
    } catch (error) {
      console.error("Error updating deck:", error);
    }
  };

  const handleDeleteFlashcard = async (flashcardId: string) => {
    if (!id) return;

    showConfirm({
      title: "Delete Flashcard",
      message: "Are you sure you want to delete this flashcard?",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await deleteFlashcard(flashcardId);
          await getDeckFlashcards(id);
        } catch (error) {
          console.error("Error deleting flashcard:", error);
        }
      },
    });
  };

  const handleEditFlashcard = (flashcardId: string) => {
    router.push(`/flashcards/${flashcardId}/edit`);
  };

  const handleDeleteDeck = useCallback(async () => {
    if (!id) return;

    showConfirm({
      title: "Delete Deck",
      message:
        "Are you sure you want to delete this deck? This action cannot be undone.",
      onConfirm: async () => {
        const success = await deleteDeck(id);
        if (success) {
          router.replace("/dashboard/decks");
        }
      },
    });
  }, [id, deleteDeck, router, showConfirm]);

  if (!deck) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <BackButton />
        <CustomText>Loading deck...</CustomText>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <BackButton />
      <ScrollView>
        <CustomText variant="titleLarge" bold>
          Edit Deck
        </CustomText>

        <Form
          fields={fields}
          onSubmit={handleSubmit}
          submitButtonText="Update Deck"
          zodSchema={deckFormSchema}
          defaultValues={{
            title: deck.title,
            description: deck.description,
            category: deck.category as DeckCategory,
            tags: deck.tags.join(", "),
            isPublic: deck.isPublic,
            consent: true,
            imageFile: deck.imageUrl
              ? {
                  uri: deck.imageUrl,
                  type: "image/jpeg",
                  name: deck.imageUrl.split("/").pop() || "image.jpg",
                }
              : undefined,
          }}
        />

        <CustomButton
          mode="contained"
          title="Delete Deck"
          onPress={handleDeleteDeck}
          style={[{ backgroundColor: theme.colors.error }]}
        />

        <View style={styles.flashcardsSection}>
          <CustomText variant="titleMedium" bold style={styles.sectionTitle}>
            Flashcards
          </CustomText>

          {flashcardsLoading ? (
            <CustomText>Loading flashcards...</CustomText>
          ) : flashcards.length === 0 ? (
            <CustomText style={styles.emptyText}>
              No flashcards yet. Add some to get started!
            </CustomText>
          ) : (
            flashcards.map((flashcard) => (
              <FlashcardItem
                key={flashcard.id}
                id={flashcard.id}
                frontWord={flashcard.frontWord}
                backWord={flashcard.backWord}
                imageUrl={flashcard.imageUrl}
                onEdit={handleEditFlashcard}
                onDelete={handleDeleteFlashcard}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  flashcardsSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 16,
    opacity: 0.7,
  },
});
