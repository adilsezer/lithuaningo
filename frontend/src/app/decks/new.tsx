import React, { useMemo, useCallback } from "react";
import { View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import BackButton from "@components/layout/BackButton";
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
        options: [
          ...deckCategories.map((cat: DeckCategory) => ({
            label: cat,
            value: cat,
          })),
        ],
      },
      {
        name: "tags",
        label: "Tags (comma separated)",
        category: "text-input",
        type: "text",
        placeholder: "Enter tags",
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

      const newDeck: Omit<Deck, "id"> = {
        title: data.title,
        description: data.description,
        category: data.category || "Other",
        tags:
          typeof data.tags === "string"
            ? (data.tags as string)
                .split(",")
                .map((tag: string) => tag.trim())
                .filter(Boolean)
            : [],
        flashcardCount: 0,
        createdAt: new Date(),
        createdBy: "", // Will be set by the backend
        createdByUsername: "", // Will be set by the backend
      };

      try {
        const deckId = await createDeck(newDeck.title, newDeck.description);
        if (typeof deckId === "string") {
          router.push(`/flashcards/new?deckId=${deckId}`);
        }
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
