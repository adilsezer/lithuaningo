import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
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
import {
  getSortedSentencesBySimilarity,
  getRandomOptions,
} from "@utils/learningUtils";
import { storeData, retrieveData, clearData } from "@utils/storageUtil";
import { getCurrentDateKey } from "@utils/dateUtils";

const QuizScreen: React.FC = () => {
  const [similarSentences, setSimilarSentences] = useState<Sentence[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [quizType, setQuizType] = useState<string>("multipleChoice");
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [showContinueButton, setShowContinueButton] = useState<boolean>(false);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const userData = useAppSelector(selectUserData);
  const loading = useAppSelector(selectIsLoading);
  const dispatch = useAppDispatch();

  const QUIZ_PROGRESS_KEY = `quizProgress_${
    userData?.id
  }_${getCurrentDateKey()}`;

  const loadQuizData = async () => {
    if (!userData?.id) return; // Ensure userData and userData.id are defined
    try {
      dispatch(setLoading(true)); // Dispatch action to set loading true

      const recentLearnedSentenceIds =
        await userProfileService.getMostRecentTwoLearnedSentences(userData.id);

      // Fetch the two most recent learned sentences
      const fetchedLearnedSentences = await Promise.all(
        recentLearnedSentenceIds.map((id) =>
          sentenceService.fetchSentenceById(id)
        )
      );

      // Fetch all sentences
      const fetchedSentences = await sentenceService.fetchSentences();

      // Get 5 most similar sentences for each learned sentence
      const sortedSentencesPromises = fetchedLearnedSentences.map(
        (learnedSentence) =>
          getSortedSentencesBySimilarity(learnedSentence, fetchedSentences)
      );
      const sortedSentencesArrays = await Promise.all(sortedSentencesPromises);

      // Take the top 5 similar sentences from each array
      const topSimilarSentences = sortedSentencesArrays.flatMap((sentences) =>
        sentences.slice(0, 5)
      );

      // Shuffle the combined array to randomize the order of the sentences
      const shuffledSentences = topSimilarSentences.sort(
        () => Math.random() - 0.5
      );

      setSimilarSentences(shuffledSentences);

      // Load stored progress if available
      const storedProgress = await retrieveData<number>(QUIZ_PROGRESS_KEY);
      if (storedProgress !== null) {
        if (storedProgress >= shuffledSentences.length) {
          setQuizCompleted(true);
        } else {
          setQuestionIndex(storedProgress);
          loadQuestion(shuffledSentences[storedProgress]);
        }
      } else {
        loadQuestion(shuffledSentences[0]); // Load the first question initially
      }

      dispatch(setLoading(false)); // Dispatch action to set loading false
    } catch (error) {
      console.error("Error loading quiz data:", error);
      dispatch(setLoading(false)); // Dispatch action to set loading false in case of error
    }
  };

  //
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
    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);
    storeData(QUIZ_PROGRESS_KEY, nextIndex);
  };

  const handleClearCompletionStatus = async () => {
    await clearData(QUIZ_PROGRESS_KEY);
    setQuizCompleted(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {quizCompleted ? (
        <View>
          <CompletedScreen
            displayText="You have completed today's session!"
            buttonText="Go to Leaderboard"
            navigationRoute="/dashboard/leaderboard"
          />
          <CustomButton
            title="Clear Completion Status"
            onPress={handleClearCompletionStatus}
            style={{
              backgroundColor: "red",
              marginTop: 20,
              alignSelf: "center",
            }}
          />
        </View>
      ) : (
        <View>
          <Text
            style={[globalStyles.subtitle, { color: globalColors.primary }]}
          >
            {questionIndex + 1} / {similarSentences.length} Questions Complete
          </Text>
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default QuizScreen;
