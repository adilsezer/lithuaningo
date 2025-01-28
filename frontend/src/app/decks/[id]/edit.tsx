import React, { useEffect, useState, useCallback } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Form } from "@components/form/Form";
import { useDecks } from "@hooks/useDecks";
import { useFlashcards } from "@hooks/useFlashcards";
import { deckFormSchema } from "@utils/zodSchemas";
import { useTheme, Card, IconButton, Button } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import { FormField } from "@components/form/form.types";
import { deckCategories } from "@src/types/DeckCategory";
import type { Deck, Flashcard } from "@src/types";
import BackButton from "@components/layout/BackButton";
import { useAlertDialog } from "@components/ui/AlertDialog";

export default function EditDeckScreen() {
  const theme = useTheme();
  const router = useRouter();
  const alertDialog = useAlertDialog();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getDeckById, updateDeck } = useDecks();
  const {
    flashcards,
    fetchDeckFlashcards,
    removeFlashcardFromDeck,
    isLoading,
  } = useFlashcards();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDeck = useCallback(async () => {
    if (id) {
      const fetchedDeck = await getDeckById(id);
      setDeck(fetchedDeck);
      setLoading(false);
    }
  }, [id, getDeckById]);

  useEffect(() => {
    fetchDeck();
  }, [fetchDeck]);

  useEffect(() => {
    if (id) {
      fetchDeckFlashcards(id);
    }
  }, [id, fetchDeckFlashcards]);

  const handleSubmit = async (data: Partial<Deck>) => {
    if (deck && id) {
      await updateDeck(id, { ...deck, ...data });
      router.push(`/decks/${id}`);
    }
  };

  const handleDeleteFlashcard = async (flashcardId: string) => {
    if (!id) return;

    alertDialog.confirm({
      title: "Delete Flashcard",
      message: "Are you sure you want to delete this flashcard?",
      confirmText: "Delete",
      confirmStyle: "destructive",
      cancelText: "Cancel",
      onConfirm: async () => {
        await removeFlashcardFromDeck(id, flashcardId);
      },
    });
  };

  const handleEditFlashcard = (flashcardId: string) => {
    router.push(`/flashcards/${flashcardId}/edit`);
  };

  if (loading || !deck) {
    return <CustomText>Loading...</CustomText>;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <BackButton />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomText variant="titleLarge" bold>
          Edit Deck
        </CustomText>

        <Form
          fields={[
            {
              name: "title",
              label: "Title",
              category: "text-input",
              type: "text",
              placeholder: "Enter deck title",
              defaultValue: deck.title,
            },
            {
              name: "description",
              label: "Description",
              category: "text-input",
              type: "text",
              placeholder: "Enter deck description",
              defaultValue: deck.description,
            },
            {
              name: "category",
              label: "Category",
              category: "selection",
              type: "picker",
              options: deckCategories.map((cat) => ({
                label: cat,
                value: cat,
              })),
              defaultValue: deck.category,
            },
          ]}
          onSubmit={handleSubmit}
          submitButtonText="Update Deck"
          zodSchema={deckFormSchema}
        />

        <View style={styles.flashcardsSection}>
          <View style={styles.sectionHeader}>
            <CustomText variant="titleMedium" bold>
              Flashcards
            </CustomText>
            <Button
              mode="contained"
              onPress={() => router.push(`/flashcards/new?deckId=${id}`)}
              icon="plus"
            >
              Add Flashcard
            </Button>
          </View>

          {isLoading ? (
            <CustomText>Loading flashcards...</CustomText>
          ) : flashcards.length === 0 ? (
            <CustomText style={styles.emptyText}>
              No flashcards yet. Add some to get started!
            </CustomText>
          ) : (
            flashcards.map((flashcard) => (
              <Card key={flashcard.id} style={styles.flashcardItem}>
                <Card.Content>
                  <View style={styles.flashcardContent}>
                    <View style={styles.flashcardText}>
                      <CustomText bold>{flashcard.front}</CustomText>
                      <CustomText style={styles.translationText}>
                        {flashcard.back}
                      </CustomText>
                    </View>
                    <View style={styles.flashcardActions}>
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => handleEditFlashcard(flashcard.id)}
                      />
                      <IconButton
                        icon="delete"
                        size={20}
                        onPress={() => handleDeleteFlashcard(flashcard.id)}
                      />
                    </View>
                  </View>
                </Card.Content>
              </Card>
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
  },
  scrollContent: {
    padding: 16,
  },
  flashcardsSection: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  flashcardItem: {
    marginBottom: 12,
  },
  flashcardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  flashcardText: {
    flex: 1,
  },
  translationText: {
    marginTop: 4,
    opacity: 0.7,
  },
  flashcardActions: {
    flexDirection: "row",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 16,
    opacity: 0.7,
  },
});
