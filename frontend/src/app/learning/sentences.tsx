import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import CustomButton from "@components/ui/CustomButton";
import BackButton from "@components/layout/BackButton";
import CompletedLayout from "@components/learning/CompletedLayout";
import RenderClickableWords from "@components/learning/RenderClickableWords";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { Sentence } from "@src/types";
import { SectionTitle, Subtitle, SectionText } from "@components/typography";
import { useSentencesScreen } from "@hooks/useSentencesScreen";

const SentencesScreen: React.FC = () => {
  const {
    sentences,
    error,
    wordsCompleted,
    sentencesCompleted,
    handleProceedToQuiz,
    handleNavigateToDashboard,
  } = useSentencesScreen();

  const { colors } = useThemeStyles();

  if (error) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <BackButton />
        <SectionText style={{ color: colors.error }}>{error}</SectionText>
      </ScrollView>
    );
  }

  if (sentencesCompleted) {
    return (
      <ScrollView>
        <CompletedLayout
          title="Fantastic! You've Reviewed All the Words for Today!"
          subtitle="Ready to test your knowledge?"
          buttonText="Start Quiz"
          navigationRoute="/learning/quiz"
          showStats={false}
        />
        <CustomButton
          title="Go to Dashboard"
          onPress={handleNavigateToDashboard}
        />
      </ScrollView>
    );
  }

  if (sentences.length === 0) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <BackButton />
        <SectionText>
          No new sentences to learn. Please check back later.
        </SectionText>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <BackButton />
      <SectionTitle>
        Let's review today's vocabulary before practice!
      </SectionTitle>
      <Subtitle>Click on each word to find out what it means.</Subtitle>
      <View style={styles.contentContainer}>
        {sentences.map((sentence: Sentence, index) => (
          <View key={sentence.id}>
            <View style={styles.sentenceContainer}>
              <RenderClickableWords
                sentenceText={sentence.text}
                answerText=""
                useClickedWordsColor={true}
              />
            </View>
            {index < sentences.length - 1 && (
              <View
                style={[
                  styles.horizontalRule,
                  { borderBottomColor: colors.border },
                ]}
              />
            )}
          </View>
        ))}
        {!wordsCompleted && (
          <Subtitle style={styles.allWordsClickedSection}>
            Click all words to unlock the proceed button.
          </Subtitle>
        )}
      </View>
      {wordsCompleted && (
        <View style={styles.buttonContainer}>
          <CustomButton title="Proceed to Quiz" onPress={handleProceedToQuiz} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 80,
  },
  horizontalRule: {
    width: "80%",
    alignSelf: "center",
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  sentenceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  allWordsClickedSection: {
    marginVertical: 60,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
});

export default SentencesScreen;
