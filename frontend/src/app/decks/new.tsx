import React from "react";
import { View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { AlertDialog } from "@components/ui/AlertDialog";
import type { Deck } from "@src/types";
import deckService from "@services/data/deckService";
import BackButton from "@components/layout/BackButton";
import { Form } from "@components/form/Form";
import { SectionTitle } from "@components/typography";
import { FormField } from "@components/form/form.types";
import { deckCategories, DeckCategory } from "@src/types/DeckCategory";

export default function NewDeckScreen() {
  const router = useRouter();
  const userData = useAppSelector(selectUserData);
  const { colors } = useThemeStyles();

  const fields: FormField[] = [
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
  ];

  const handleSubmit = async (data: Partial<Deck>) => {
    try {
      if (!userData?.id) {
        AlertDialog.error("Please login to create decks");
        return;
      }

      const newDeck: Omit<Deck, "id"> = {
        title: data.title || "",
        description: data.description || "",
        category: data.category || "",
        createdBy: userData.id,
        createdByUsername: userData.name || "",
        createdAt: new Date().toISOString(),
        tags:
          typeof data.tags === "string"
            ? (data.tags as string).split(",").map((tag: string) => tag.trim())
            : (data.tags as string[]) || [],
      };

      const deckId = await deckService.createDeck(newDeck as Deck);
      AlertDialog.success("Deck created successfully");
      router.push(`/flashcards/new?deckId=${deckId}`);
    } catch (error) {
      AlertDialog.error("Failed to create deck");
      console.error("Error creating deck:", error);
    }
  };

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
