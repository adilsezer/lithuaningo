import React from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import CategoryGrid from "@components/ui/CategoryGrid";
import { FlashcardCategory } from "@components/ui/CategoryCard";
import CustomDivider from "@components/ui/CustomDivider";

export default function FlashcardScreen() {
  const theme = useTheme();

  // Sample categories with descriptions
  const categories: FlashcardCategory[] = [
    {
      id: "1",
      name: "Verbs",
      description: "Action words like eat, sleep, run",
      color: theme.colors.primary,
    },
    {
      id: "2",
      name: "Nouns",
      description: "People, places, things, and ideas",
      color: theme.colors.secondary,
    },
    {
      id: "3",
      name: "Greetings",
      description: "Common expressions to say hello",
      color: theme.colors.tertiary,
    },
    {
      id: "4",
      name: "Basic",
      description: "Essential words for beginners",
      color: theme.colors.onPrimaryContainer,
    },
    {
      id: "5",
      name: "Advanced",
      description: "Complex words and expressions",
      color: theme.colors.onSecondaryContainer,
    },
    {
      id: "6",
      name: "Phrases",
      description: "Useful everyday expressions",
      color: theme.colors.onTertiaryContainer,
    },
  ];

  const handleSelectCategory = (category: FlashcardCategory) => {
    // Handle category selection
    console.log("Selected category:", category.name);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <CustomText variant="titleLarge" bold>
        Flashcards
      </CustomText>
      <CustomText variant="bodyLarge">Choose a category to practice</CustomText>

      <CustomDivider />

      <CategoryGrid
        categories={categories}
        onSelectCategory={handleSelectCategory}
        title="Categories"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
