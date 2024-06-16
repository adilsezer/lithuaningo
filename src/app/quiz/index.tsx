// src/screens/QuizScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import sentenceService, { Sentence } from "../../services/data/sentenceService";
import wordService, { Word } from "../../services/data/wordService";
import userProfileService from "../../services/data/userProfileService";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useAppSelector } from "@src/redux/hooks";
import { selectUserData } from "@src/redux/slices/userSlice";
import MultipleChoiceQuiz from "@components/MultipleChoiceQuiz";
import FillInTheBlankQuiz from "@components/FillInTheBlankQuiz";
import CustomButton from "@components/CustomButton";
import CompletedScreen from "@components/CompletedScreen";
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
      const sortedSentences = await getSortedSentencesBySimilarity(
        fetchedLearnedSentence,
        fetchedSentences
      );
      setSimilarSentences(sortedSentences);
      loadQuestion(sortedSentences[0]); // Load the first question initially
    } catch (error) {
      console.error("Error loading quiz data:", error);
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

        console.error("No word details found for the random word", randomWord);
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

  return (
    <View style={styles.container}>
      {quizCompleted ? (
        <CompletedScreen />
      ) : (
        <>
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
        </>
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
