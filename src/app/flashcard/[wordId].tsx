// app/flashcard/[wordId].tsx
import React, { useEffect } from "react";
import FlashcardScreen from "../../components/FlashcardScreen";
import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

const Flashcard = () => {
  const { wordId } = useLocalSearchParams<{ wordId: string }>();
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  useEffect(() => {
    if (!wordId) {
      // Handle the case where wordId is undefined (e.g., show an error message or redirect)
      return;
    }

    const fetchData = async () => {
      try {
        // Simulate data fetching
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Error loading flashcard data:", error);
      } finally {
      }
    };

    fetchData();
  }, [wordId]);

  if (!wordId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[globalStyles.text, { color: globalColors.error }]}>
          Error: wordId is missing
        </Text>
      </View>
    );
  }

  return <FlashcardScreen wordId={wordId} />;
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Flashcard;
