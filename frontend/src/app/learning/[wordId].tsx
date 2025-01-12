import React from "react";
import FlashcardScreen from "@components/learning/Flashcard";
import { useLocalSearchParams } from "expo-router";
import { View, StyleSheet } from "react-native";
import { SectionText } from "@components/typography";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useWordDetails } from "@hooks/useWordDetails";
import LoadingIndicator from "@components/ui/LoadingIndicator";

const Flashcard = () => {
  const { wordId } = useLocalSearchParams<{ wordId: string }>();
  const { colors } = useThemeStyles();
  const { loading, error, isValidWordId } = useWordDetails(wordId);

  if (loading) {
    return <LoadingIndicator />;
  }

  if (!isValidWordId) {
    return (
      <View style={styles.errorContainer}>
        <SectionText style={{ color: colors.error }}>
          Error: wordId is missing
        </SectionText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <SectionText style={{ color: colors.error }}>
          {error.message || "An error occurred while loading the word"}
        </SectionText>
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
