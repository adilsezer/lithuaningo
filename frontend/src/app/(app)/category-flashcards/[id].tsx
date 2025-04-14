import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, FlatList } from "react-native";
import { useTheme, Card, Button } from "react-native-paper";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFlashcards } from "@src/hooks/useFlashcards";
import {
  FlashcardCategory,
  DifficultyLevel,
  FlashcardResponse,
} from "@src/types/Flashcard";
import CustomText from "@components/ui/CustomText";
import CustomDivider from "@components/ui/CustomDivider";

export default function CategoryFlashcardsScreen() {
  const theme = useTheme();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const { flashcards, isLoading, error, getFlashcards } = useFlashcards();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    fetchFlashcards();
  }, [id]);

  const fetchFlashcards = async () => {
    try {
      const numericId = parseInt(id);

      // Determine if it's a difficulty level or a category
      if (numericId >= 0 && numericId <= 2) {
        // It's a difficulty level
        await getFlashcards({
          primaryCategory: FlashcardCategory.AllCategories, // Get all categories
          count: 10,
          difficulty: numericId as DifficultyLevel,
        });
      } else {
        // It's a category
        await getFlashcards({
          primaryCategory: numericId as FlashcardCategory,
          count: 10,
          difficulty: DifficultyLevel.Basic, // Default difficulty
        });
      }
    } catch (err) {
      console.error("Error fetching flashcards:", err);
    }
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
    }
  };

  const renderFlashcard = (item: FlashcardResponse) => {
    return (
      <Card style={styles.card} onPress={handleFlip}>
        <Card.Content style={styles.cardContent}>
          <CustomText variant="titleMedium" style={styles.cardText}>
            {flipped ? item.backText : item.frontText}
          </CustomText>
          {flipped && item.exampleSentence && (
            <View style={styles.exampleContainer}>
              <CustomDivider />
              <CustomText variant="bodyMedium" style={styles.exampleText}>
                {item.exampleSentence}
              </CustomText>
              <CustomText variant="bodySmall" style={styles.translationText}>
                {item.exampleSentenceTranslation}
              </CustomText>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (isLoading && flashcards.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <CustomText>Loading flashcards...</CustomText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <CustomText variant="bodyLarge" style={styles.errorText}>
          {error}
        </CustomText>
        <Button mode="contained" onPress={fetchFlashcards}>
          Retry
        </Button>
      </View>
    );
  }

  if (flashcards.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <CustomText variant="bodyLarge">
          No flashcards found for this category.
        </CustomText>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <CustomText variant="titleLarge" bold>
          {name} Flashcards
        </CustomText>
        <CustomText variant="bodyMedium">
          Card {currentIndex + 1} of {flashcards.length}
        </CustomText>
        <CustomText variant="bodySmall">Tap card to flip</CustomText>
      </View>

      {flashcards.length > 0 && renderFlashcard(flashcards[currentIndex])}

      <View style={styles.navigationButtons}>
        <Button
          mode="outlined"
          onPress={handlePrevious}
          disabled={currentIndex === 0}
          style={styles.navButton}
        >
          Previous
        </Button>
        <Button
          mode="contained"
          onPress={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          style={styles.navButton}
        >
          Next
        </Button>
      </View>

      <Button
        mode="text"
        onPress={() => router.back()}
        style={styles.backButton}
      >
        Back to Categories
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  card: {
    marginVertical: 20,
    minHeight: 200,
  },
  cardContent: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  cardText: {
    textAlign: "center",
  },
  exampleContainer: {
    marginTop: 16,
    width: "100%",
  },
  exampleText: {
    fontStyle: "italic",
    marginVertical: 4,
  },
  translationText: {
    opacity: 0.7,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  backButton: {
    marginTop: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
});
