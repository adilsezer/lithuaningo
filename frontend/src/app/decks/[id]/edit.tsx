import React, { useEffect, useState, useCallback } from "react";
import { View, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Form } from "@components/form/Form";
import { useDecks } from "@hooks/useDecks";
import { deckFormSchema } from "@utils/zodSchemas";
import { useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import { deckCategories } from "@src/types/DeckCategory";
import type { Deck } from "@src/types";
import BackButton from "@components/layout/BackButton";

export default function EditDeckScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getDeckById, updateDeck } = useDecks();
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

  const handleSubmit = async (data: Partial<Deck>) => {
    if (deck && id) {
      await updateDeck(id, { ...deck, ...data });
      router.push(`/decks/${id}`);
    }
  };

  if (loading || !deck) {
    return <CustomText>Loading...</CustomText>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <BackButton />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
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
      </ScrollView>
    </View>
  );
}
