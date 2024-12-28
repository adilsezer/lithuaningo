import React from "react";
import { View, StyleSheet } from "react-native";
import { SectionText } from "@components/typography";

interface WordContentProps {
  word: string;
  partOfSpeech: string;
  ipa: string;
  englishTranslation: string;
  sentenceUsage: string;
  isDarkMode: boolean;
}

const WordContent: React.FC<WordContentProps> = ({
  word,
  partOfSpeech,
  ipa,
  englishTranslation,
  sentenceUsage,
  isDarkMode,
}) => (
  <>
    <View style={styles.centered}>
      <SectionText style={styles.wordTitle} contrast={isDarkMode}>
        {word}
      </SectionText>
      <SectionText style={styles.subtitle} contrast={isDarkMode}>
        ({partOfSpeech})
      </SectionText>
      <SectionText style={styles.subtitle} contrast={isDarkMode}>
        {ipa}
      </SectionText>
    </View>
    <View style={styles.centered}>
      <SectionText style={styles.subtitle} contrast={isDarkMode}>
        Meaning:
      </SectionText>
      <SectionText contrast={isDarkMode}>{englishTranslation}</SectionText>
    </View>
    <View style={styles.centered}>
      <SectionText style={styles.subtitle} contrast={isDarkMode}>
        Example:
      </SectionText>
      <SectionText style={{ fontStyle: "italic" }} contrast={isDarkMode}>
        {sentenceUsage}
      </SectionText>
    </View>
  </>
);

interface WordOfTheDayCardProps {
  word: string;
  loading: boolean;
  partOfSpeech: string;
  ipa: string;
  englishTranslation: string;
  sentenceUsage: string;
  isDarkMode: boolean;
  backgroundColor: string;
}

export const WordOfTheDayCard: React.FC<WordOfTheDayCardProps> = ({
  word,
  loading,
  partOfSpeech,
  ipa,
  englishTranslation,
  sentenceUsage,
  isDarkMode,
  backgroundColor,
}) => (
  <View style={[styles.card, { backgroundColor }]}>
    <SectionText style={styles.cardTitle} contrast={isDarkMode}>
      Expand Your Vocabulary
    </SectionText>
    {loading ? (
      <SectionText contrast={isDarkMode}>Loading...</SectionText>
    ) : (
      <WordContent
        word={word}
        partOfSpeech={partOfSpeech}
        ipa={ipa}
        englishTranslation={englishTranslation}
        sentenceUsage={sentenceUsage}
        isDarkMode={isDarkMode}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    borderWidth: 0.2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  wordTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginVertical: 4,
  },
  centered: {
    alignItems: "center",
    marginVertical: 4,
  },
});
