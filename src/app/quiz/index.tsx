// src/screens/QuizScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import sentenceService, { Sentence } from "../../services/data/sentenceService";
import wordService, { Word } from "../../services/data/wordService";
import userProfileService from "../../services/data/userProfileService";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useAppSelector } from "@src/redux/hooks";
import { selectUserData } from "@src/redux/slices/userSlice";
import MultipleChoiceQuiz from "@components/MultipleChoiceQuiz";
import FillInTheBlankQuiz from "@components/FillInTheBlankQuiz";
import {
  getMostSimilarSentence,
  getRandomWord,
  getRandomOptions,
} from "@utils/quizUtils";

const QuizScreen: React.FC = () => {
  const [learnedSentence, setLearnedSentence] = useState<Sentence | null>(null);
  const [similarSentence, setSimilarSentence] = useState<Sentence | null>(null);
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [quizType, setQuizType] = useState<string>("multipleChoice");
  const router = useRouter();
  const { styles: globalStyles } = useThemeStyles();
  const userData = useAppSelector(selectUserData);

  useEffect(() => {
    const loadQuizData = async () => {
      if (!userData?.id) return; // Ensure userData and userData.id are defined
      try {
        const learnedSentenceId =
          await userProfileService.getMostRecentLearnedSentence(userData.id);
        const fetchedLearnedSentence = await sentenceService.fetchSentenceById(
          learnedSentenceId
        );
        setLearnedSentence(fetchedLearnedSentence);

        const fetchedSentences = await sentenceService.fetchSentences();
        const mostSimilarSentence = await getMostSimilarSentence(
          fetchedLearnedSentence,
          fetchedSentences
        );
        setSimilarSentence(mostSimilarSentence);

        const randomWord = getRandomWord(
          mostSimilarSentence.sentence.split(" ")
        );
        const correctWordDetails = await wordService.fetchWordByGrammaticalForm(
          randomWord
        );

        if (!correctWordDetails) {
          console.error("No word details found for the random word");
          setQuestion(
            "No valid question could be generated. Please try again."
          );
          setOptions([]);
          return;
        }

        const fetchedWords = await wordService.fetchWords();
        const otherOptions = getRandomOptions(
          fetchedWords,
          correctWordDetails.english_translation
        );

        setQuestion(
          `In the sentence '${mostSimilarSentence.sentence}', what does '${randomWord}' mean in English?`
        );
        setCorrectAnswer(correctWordDetails.english_translation);
        setOptions(
          [...otherOptions, correctWordDetails.english_translation].sort(
            () => Math.random() - 0.5
          )
        );

        // Randomly select quiz type
        setQuizType(Math.random() > 0.5 ? "multipleChoice" : "fillInTheBlank");
      } catch (error) {
        console.error("Error loading quiz data:", error);
      }
    };

    loadQuizData();
  }, [userData]);

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      alert("Correct!");
    } else {
      alert(`Wrong! The correct answer is "${correctAnswer}".`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={globalStyles.title}>Quiz</Text>
      {quizType === "multipleChoice" ? (
        <MultipleChoiceQuiz
          question={question}
          options={options}
          correctAnswer={correctAnswer}
          onAnswer={handleAnswer}
        />
      ) : (
        <FillInTheBlankQuiz
          question={question}
          correctAnswer={correctAnswer}
          onAnswer={handleAnswer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});

export default QuizScreen;
