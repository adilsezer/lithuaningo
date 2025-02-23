import React, { useCallback } from "react";
import { View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import BackButton from "@components/ui/BackButton";
import { Form } from "@components/form/Form";
import { useDecks } from "@hooks/useDecks";
import { FormField } from "@components/form/form.types";
import { deckCategories } from "@src/types/DeckCategory";
import { DeckFormData } from "@src/types";
import { deckFormSchema } from "@utils/zodSchemas";
import { useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import { useUserData } from "@stores/useUserStore";

export default function NewDeckScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { createDeck, isLoading } = useDecks();
  const userData = useUserData();

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
      placeholderText: "Tap to select deck cover image",
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
  ];

  const handleSubmit = useCallback(
    async (data: DeckFormData) => {
      if (!userData?.id) return;

      try {
        const deckId = await createDeck(
          {
            userId: userData.id,
            title: data.title,
            description: data.description,
            category: data.category,
            tags:
              data.tags
                ?.split(",")
                .map((tag) => tag.trim())
                .filter(Boolean) ?? [],
            isPublic: data.isPublic ?? true,
          },
          data.imageFile
        );

        if (deckId) {
          router.push(`/flashcards/new?deckId=${deckId}`);
        }
      } catch (error) {
        console.error("Failed to create deck:", error);
      }
    },
    [createDeck, router, userData?.id]
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
          isLoading={isLoading}
        />
      </ScrollView>
    </View>
  );
}
