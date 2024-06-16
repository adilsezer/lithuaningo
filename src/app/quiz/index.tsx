// src/screens/QuizScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import sentenceService, { Sentence } from "../../services/data/sentenceService";
import wordService from "../../services/data/wordService";
import userProfileService from "../../services/data/userProfileService";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useAppDispatch, useAppSelector } from "@src/redux/hooks";
import { selectUserData } from "@src/redux/slices/userSlice";
import { selectIsLoading, setLoading } from "@src/redux/slices/uiSlice";
import MultipleChoiceQuiz from "@components/MultipleChoiceQuiz";
import FillInTheBlankQuiz from "@components/FillInTheBlankQuiz";
import CustomButton from "@components/CustomButton";
import CompletedScreen from "@components/CompletedScreen";
import BackButton from "@components/BackButton";
import {
  getSortedSentencesBySimilarity,
  getRandomWord,
  getRandomOptions,
} from "@utils/quizUtils";

const QuizScreen: React.FC = () => {
  const [learnedSentence, setLearnedSentence] = useState<Sentence | null>(null);
  const [similarSentences, setSimilarSentences] = useState<Sentence[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [quizType, setQuizType] = useState<string>("multipleChoice");
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [showContinueButton, setShowContinueButton] = useState<boolean>(false);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const { styles: globalStyles } = useThemeStyles();
  const userData = useAppSelector(selectUserData);
  const loading = useAppSelector(selectIsLoading);
  const dispatch = useAppDispatch();

  const loadQuizData = async () => {
    if (!userData?.id) return; // Ensure userData and userData.id are defined
    try {
      dispatch(setLoading(true)); // Dispatch action to set loading true

      const learnedSentenceId =
        await userProfileService.getMostRecentLearnedSentence(userData.id);
      const fetchedLearnedSentence = await sentenceService.fetchSentenceById(
        learnedSentenceId
      );
      setLearnedSentence(fetchedLearnedSentence);

      const fetchedSentences = await sentenceService.fetchSentences();
      const sortedSentences = await getSortedSentencesBySimilarity(
        fetchedLearnedSentence,
        fetchedSentences
      );
      setSimilarSentences(sortedSentences);
      loadQuestion(sortedSentences[0]); // Load the first question initially

      dispatch(setLoading(false)); // Dispatch action to set loading false
    } catch (error) {
      console.error("Error loading quiz data:", error);
      dispatch(setLoading(false)); // Dispatch action to set loading false in case of error
    }
  };

  const loadQuestion = async (similarSentence: Sentence) => {
    try {
      const sentenceWords = similarSentence.sentence.split(" ");
      let randomWord, correctWordDetails;

      for (const word of sentenceWords) {
        randomWord = word;
        correctWordDetails = await wordService.fetchWordByGrammaticalForm(
          randomWord
        );

        if (correctWordDetails) break;

        console.warn("No word details found for the random word", randomWord);
      }

      if (!correctWordDetails) {
        setQuestion("No valid question could be generated. Please try again.");
        setOptions([]);
        return;
      }

      const fetchedWords = await wordService.fetchWords();
      const otherOptions = getRandomOptions(
        fetchedWords,
        correctWordDetails.english_translation
      );

      setQuestion(
        `In the sentence '${similarSentence.sentence}', what is the base form of '${randomWord}' in English?`
      );
      setCorrectAnswer(correctWordDetails.english_translation);
      setOptions(
        [...otherOptions, correctWordDetails.english_translation].sort(
          () => Math.random() - 0.5
        )
      );

      // Randomly select quiz type
      setQuizType(Math.random() > 0.5 ? "multipleChoice" : "fillInTheBlank");
      setShowContinueButton(false);
    } catch (error) {
      console.error("Error loading question:", error);
    }
  };

  useEffect(() => {
    loadQuizData();
  }, [userData]);

  useEffect(() => {
    if (
      similarSentences.length > 0 &&
      questionIndex < similarSentences.length
    ) {
      loadQuestion(similarSentences[questionIndex]);
      setQuizCompleted(false);
    } else if (questionIndex >= similarSentences.length) {
      setQuizCompleted(true);
    }
  }, [questionIndex, similarSentences]);

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      alert("Correct!");
    } else {
      alert(`Wrong! The correct answer is "${correctAnswer}".`);
    }
    setShowContinueButton(true);
  };

  const handleContinue = () => {
    setQuestionIndex((prevIndex) => prevIndex + 1);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      {quizCompleted ? (
        <CompletedScreen />
      ) : (
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
          {showContinueButton && (
            <CustomButton title="Continue" onPress={handleContinue} />
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default QuizScreen;
