import React, { useMemo, useCallback } from "react";
import { View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import BackButton from "@components/ui/BackButton";
import { Form } from "@components/form/Form";
import { useDecks } from "@hooks/useDecks";
import { FormField } from "@components/form/form.types";
import { deckCategories, DeckCategory } from "@src/types/DeckCategory";
import type { CreateDeckRequest } from "@src/types";
import type { ImageFile } from "@src/types";
import { deckFormSchema } from "@utils/zodSchemas";
import { useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import { useUserData } from "@stores/useUserStore";
import { CustomImagePicker } from "@components/ui/CustomImagePicker";

interface DeckFormData {
  title: string;
  description: string;
  category: DeckCategory;
  tags?: string;
  isPublic?: boolean;
  imageFile?: ImageFile;
  consent: boolean;
}

export default function NewDeckScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { createDeck } = useDecks();
  const userData = useUserData();

  const fields: FormField[] = useMemo(
    () => [
      {
        name: "title",
        label: "Title",
        category: "text-input",
        type: "text",
        placeholder: "Enter deck title (1-100 characters)",
        required: true,
      },
      {
        name: "description",
        label: "Description",
        category: "text-input",
        type: "text",
        multiline: true,
        numberOfLines: 3,
        placeholder: "Enter deck description (1-1000 characters)",
        required: true,
      },
      {
        name: "category",
        label: "Category",
        category: "selection",
        type: "picker",
        required: true,
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
        label: "Tags (comma separated, max 10 tags)",
        category: "text-input",
        type: "text",
        placeholder: "e.g., basics, grammar, verbs",
        helperText: "Each tag should be less than 30 characters",
      },
      {
        name: "imageFile",
        label: "Deck Image",
        category: "image-input",
        type: "image",
        maxSize: 5 * 1024 * 1024, // 5MB limit
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
        required: true,
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
    async (data: DeckFormData) => {
      if (!userData?.id || !data.title || !data.description || !data.category) {
        return;
      }

      try {
        const createDeckRequest = {
          userId: userData.id,
          title: data.title,
          description: data.description,
          category: data.category,
          tags: data.tags
            ? data.tags
                .split(",")
                .map((tag: string) => tag.trim())
                .filter((tag: string) => tag.length > 0)
            : [],
          isPublic: data.isPublic ?? true,
        };

        const deckId = await createDeck(createDeckRequest, data.imageFile);
        if (!deckId) {
          throw new Error("Failed to create deck - no ID returned");
        }

        router.push(`/flashcards/new?deckId=${deckId}`);
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
        />
      </ScrollView>
    </View>
  );
}
