import React, { useMemo, useCallback } from "react";
import { View, ScrollView } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useRouter } from "expo-router";
import BackButton from "@components/layout/BackButton";
import { Form } from "@components/form/Form";
import { SectionTitle } from "@components/typography";
import { useDecks } from "@hooks/useDecks";
import { FormField } from "@components/form/form.types";
import { deckCategories, DeckCategory } from "@src/types/DeckCategory";
import type { Deck } from "@src/types";

export default function NewDeckScreen() {
  const { colors } = useThemeStyles();
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
        validation: {
          required: true,
          message: "Title is required",
        },
      },
      {
        name: "description",
        label: "Description",
        category: "text-input",
        type: "text",
        placeholder: "Enter deck description",
        validation: {
          required: true,
          message: "Description is required",
        },
      },
      {
        name: "category",
        label: "Category",
        category: "selection",
        type: "picker",
        options: [
          { label: "Select a category", value: "" },
          ...deckCategories.map((cat: DeckCategory) => ({
            label: cat,
            value: cat,
          })),
        ],
        validation: {
          required: true,
          message: "Category is required",
        },
      },
      {
        name: "tags",
        label: "Tags (comma separated)",
        category: "text-input",
        type: "text",
        placeholder: "Enter tags",
        validation: {
          required: false,
        },
      },
      {
        name: "consent",
        label:
          "By creating a deck, you confirm it's original, public, and compliant.",
        category: "toggle",
        type: "switch",
        validation: {
          required: true,
          message: "You must agree to the terms before creating a deck",
        },
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
      await createDeck(data);
    },
    [createDeck]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <BackButton />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <SectionTitle>Create New Deck</SectionTitle>
        <Form
          fields={fields}
          onSubmit={handleSubmit}
          submitButtonText="Create Deck"
        />
      </ScrollView>
    </View>
  );
}
