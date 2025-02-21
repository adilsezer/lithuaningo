import React, { useMemo, useCallback } from "react";
import { View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import BackButton from "@components/ui/BackButton";
import { Form } from "@components/form/Form";
import { useDecks } from "@hooks/useDecks";
import { FormField } from "@components/form/form.types";
import { deckCategories, DeckCategory } from "@src/types/DeckCategory";
import type { Deck } from "@src/types";
import { deckFormSchema } from "@utils/zodSchemas";
import { useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";

export default function NewDeckScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { createDeck } = useDecks();

  const fields: FormField[] = useMemo(
    () => [
      {
        name: "title",
        label: "Title",
        category: "text-input",
        type: "text",
        placeholder: "Enter deck title",
      },
      {
        name: "description",
        label: "Description",
        category: "text-input",
        type: "text",
        placeholder: "Enter deck description",
      },
      {
        name: "category",
        label: "Category",
        category: "selection",
        type: "picker",
        options: deckCategories
          .filter(
            (cat) => !["All Decks", "My Decks", "Top Rated"].includes(cat)
          )
          .map((cat) => ({
            label: cat,
            value: cat,
          })),
      },
      {
        name: "tags",
        label: "Tags (comma separated)",
        category: "text-input",
        type: "text",
        placeholder: "Enter tags",
      },
      {
        name: "isPublic",
        label: "Make deck public",
        category: "toggle",
        type: "switch",
        defaultValue: true,
      },
      {
        name: "consent",
        label:
          "By creating a deck, you confirm it's original, public, and compliant.",
        category: "toggle",
        type: "switch",
      },
      {
        name: "terms-link",
        category: "link",
        type: "link",
        label: "Learn more about our terms",
        linkText: "Learn more about our terms",
        onPress: () => router.push("/terms-of-service"),
      },
    ],
    [router]
  );

  const handleSubmit = useCallback(
    async (data: Partial<Deck>) => {
      if (!data.title || !data.description) {
        return;
      }

      try {
        const deckId = await createDeck(data.title, data.description);
        if (!deckId) {
          throw new Error("Failed to create deck - no ID returned");
        }

        router.push(`/flashcards/new?deckId=${deckId}`);
      } catch (error) {
        console.error("Failed to create deck:", error);
      }
    },
    [createDeck, router]
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <BackButton />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <CustomText variant="titleLarge" bold>
          Create New Deck
        </CustomText>
        <Form
          fields={fields}
          onSubmit={handleSubmit}
          submitButtonText="Create Deck"
          zodSchema={deckFormSchema}
        />
      </ScrollView>
    </View>
  );
}
