import React from "react";
import { StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { useTheme } from "react-native-paper";
import { router } from "expo-router";
import CustomText from "@components/ui/CustomText";
import CategoryGrid from "@components/ui/CategoryGrid";
import { FlashcardCategory } from "@components/ui/CategoryCard";
import CustomDivider from "@components/ui/CustomDivider";
import {
  FlashcardCategory as FlashcardCategoryEnum,
  DifficultyLevel,
} from "@src/types/Flashcard";

export default function FlashcardScreen() {
  const theme = useTheme();

  // Helper function to get theme color based on index
  const getColor = (index: number) => {
    const colors = [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.tertiary,
      theme.colors.onPrimaryContainer,
      theme.colors.onSecondaryContainer,
      theme.colors.onTertiaryContainer,
      theme.colors.primaryContainer,
      theme.colors.secondaryContainer,
      theme.colors.tertiaryContainer,
    ];
    return colors[index % colors.length];
  };

  // Difficulty level categories
  const difficultyCategories: FlashcardCategory[] = [
    {
      id: DifficultyLevel.Basic.toString(),
      name: "Basic",
      description: "Essential words for beginners",
      color: theme.colors.primary,
    },
    {
      id: DifficultyLevel.Intermediate.toString(),
      name: "Intermediate",
      description: "Medium difficulty words and phrases",
      color: theme.colors.secondary,
    },
    {
      id: DifficultyLevel.Advanced.toString(),
      name: "Advanced",
      description: "Complex words and expressions",
      color: theme.colors.tertiary,
    },
  ];

  // Grammatical categories
  const grammaticalCategories: FlashcardCategory[] = [
    {
      id: FlashcardCategoryEnum.Verb.toString(),
      name: "Verbs",
      description: "Action words like eat, sleep, run",
      color: getColor(0),
    },
    {
      id: FlashcardCategoryEnum.Noun.toString(),
      name: "Nouns",
      description: "People, places, things, and ideas",
      color: getColor(1),
    },
    {
      id: FlashcardCategoryEnum.Adjective.toString(),
      name: "Adjectives",
      description: "Words that describe nouns",
      color: getColor(2),
    },
    {
      id: FlashcardCategoryEnum.Adverb.toString(),
      name: "Adverbs",
      description: "Words that modify verbs, adjectives, or other adverbs",
      color: getColor(3),
    },
    {
      id: FlashcardCategoryEnum.Pronoun.toString(),
      name: "Pronouns",
      description: "Words that replace nouns",
      color: getColor(4),
    },
    {
      id: FlashcardCategoryEnum.Connector.toString(),
      name: "Connectors",
      description: "Words that connect phrases or sentences",
      color: getColor(5),
    },
  ];

  // Thematic categories
  const thematicCategories: FlashcardCategory[] = [
    {
      id: FlashcardCategoryEnum.Greeting.toString(),
      name: "Greetings",
      description: "Common expressions to say hello",
      color: getColor(6),
    },
    {
      id: FlashcardCategoryEnum.Phrase.toString(),
      name: "Phrases",
      description: "Useful everyday expressions",
      color: getColor(7),
    },
    {
      id: FlashcardCategoryEnum.Number.toString(),
      name: "Numbers",
      description: "Counting, quantities, and math terms",
      color: getColor(8),
    },
    {
      id: FlashcardCategoryEnum.TimeWord.toString(),
      name: "Time",
      description: "Days, months, seasons, and time expressions",
      color: getColor(0),
    },
    {
      id: FlashcardCategoryEnum.Food.toString(),
      name: "Food",
      description: "Food, drinks, and cooking terms",
      color: getColor(1),
    },
    {
      id: FlashcardCategoryEnum.Travel.toString(),
      name: "Travel",
      description: "Transportation, directions, and travel vocabulary",
      color: getColor(2),
    },
    {
      id: FlashcardCategoryEnum.Family.toString(),
      name: "Family",
      description: "Family members and relationships",
      color: getColor(3),
    },
    {
      id: FlashcardCategoryEnum.Work.toString(),
      name: "Work",
      description: "Jobs, professions, and workplace vocabulary",
      color: getColor(4),
    },
    {
      id: FlashcardCategoryEnum.Nature.toString(),
      name: "Nature",
      description: "Animals, plants, and natural phenomena",
      color: getColor(5),
    },
  ];

  // All categories option
  const allCategories: FlashcardCategory[] = [
    {
      id: FlashcardCategoryEnum.AllCategories.toString(),
      name: "All Categories",
      description: "Flashcards from all categories",
      color: theme.colors.inversePrimary,
    },
  ];

  const handleSelectCategory = (category: FlashcardCategory) => {
    // Navigate to category flashcards screen
    router.push({
      pathname: "/(app)/category-flashcards/[id]",
      params: {
        id: category.id,
        name: category.name,
      },
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.scrollView}>
        <CustomText variant="titleLarge" bold style={styles.title}>
          Flashcards
        </CustomText>
        <CustomText variant="bodyLarge" style={styles.subtitle}>
          Choose a category to practice
        </CustomText>

        <CustomDivider />

        <CategoryGrid
          categories={allCategories}
          onSelectCategory={handleSelectCategory}
          title="All Flashcards"
        />

        <CustomDivider />

        <CategoryGrid
          categories={difficultyCategories}
          onSelectCategory={handleSelectCategory}
          title="By Difficulty"
        />

        <CustomDivider />

        <CategoryGrid
          categories={grammaticalCategories}
          onSelectCategory={handleSelectCategory}
          title="Grammatical Categories"
        />

        <CustomDivider />

        <CategoryGrid
          categories={thematicCategories}
          onSelectCategory={handleSelectCategory}
          title="Thematic Categories"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  subtitle: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
});
