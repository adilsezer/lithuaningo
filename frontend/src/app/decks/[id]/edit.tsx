import React, { useEffect, useCallback } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useDecks } from "@hooks/useDecks";
import { useFlashcards } from "@hooks/useFlashcards";
import { DeckFormData } from "@src/types";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";
import BackButton from "@components/ui/BackButton";
import CustomText from "@components/ui/CustomText";
import { FlashcardItem } from "@components/ui/FlashcardItem";
import { useTheme } from "react-native-paper";
import { deckFormSchema } from "@utils/zodSchemas";
import { DeckCategory, deckCategories } from "@src/types/DeckCategory";
import CustomButton from "@components/ui/CustomButton";
import { ActivityIndicator } from "react-native-paper";
import CustomDivider from "@components/ui/CustomDivider";
// Form fields definition
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

export default function EditDeckScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Use hooks for business logic
  const { deck, isLoading: deckLoading, updateDeck, deleteDeck } = useDecks(id);

  const {
    flashcards,
    isLoading: flashcardsLoading,
    getDeckFlashcards,
    deleteFlashcard,
  } = useFlashcards();

  // Load flashcards when deck ID is available
  useEffect(() => {
    if (id) {
      getDeckFlashcards(id);
    }
  }, [id, getDeckFlashcards]);

  // Add a focus effect to refresh flashcards when returning to this screen
  useFocusEffect(
    useCallback(() => {
      if (id) {
        getDeckFlashcards(id);
      }
    }, [id, getDeckFlashcards])
  );

  // Navigation handlers
  const handleEditFlashcard = (flashcardId: string) => {
    router.push(`/flashcards/${flashcardId}/edit`);
  };

  // Form submission handler
  const handleSubmit = (data: DeckFormData) => {
    updateDeck(data, () => {
      router.push(`/decks/${id}`);
    });
  };

  // Handle flashcard deletion
  const handleDeleteFlashcard = (flashcardId: string) => {
    deleteFlashcard(flashcardId, () => {
      if (id) getDeckFlashcards(id);
    });
  };

  // Loading state
  if (deckLoading || !deck) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <BackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <CustomText style={{ marginTop: 16 }}>Loading deck...</CustomText>
        </View>
      </View>
    );
  }

  // Render the screen
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <BackButton />
      <ScrollView style={styles.scrollView}>
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
          onPress={() => deleteDeck(() => router.replace("/dashboard/decks"))}
          style={[{ backgroundColor: theme.colors.error }]}
        />

        <CustomDivider />

        <View style={styles.flashcardsSection}>
          <View style={styles.sectionHeader}>
            <CustomText variant="titleMedium" bold style={styles.sectionTitle}>
              Flashcards
            </CustomText>
            <CustomButton
              mode="contained"
              title="Add Flashcard"
              icon="plus"
              onPress={() => router.push(`/flashcards/new?deckId=${id}`)}
              style={{ backgroundColor: theme.colors.primary }}
            />
          </View>

          {flashcardsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <CustomText style={{ marginTop: 8 }}>
                Loading flashcards...
              </CustomText>
            </View>
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
  scrollView: {
    flex: 1,
  },
  flashcardsSection: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
});
