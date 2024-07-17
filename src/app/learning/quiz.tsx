import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useAppDispatch, useAppSelector } from "@src/redux/hooks";
import { selectUserData } from "@src/redux/slices/userSlice";
import { setLoading } from "@src/redux/slices/uiSlice";
import MultipleChoiceQuiz from "@components/MultipleChoiceQuiz";
import FillInTheBlankQuiz from "@components/FillInTheBlankQuiz";
import CustomButton from "@components/CustomButton";
import CompletedScreen from "@components/CompletedScreen";
import { storeData, retrieveData } from "@utils/storageUtils";
import { getCurrentDateKey } from "@utils/dateUtils";
import useData from "../../hooks/useData";
import {
  loadQuizData,
  initializeQuizState,
  QuizQuestion,
} from "../../engine/quizEngine";
import BackButton from "@components/BackButton";
import { QuizState } from "../../state/quizState";
import crashlytics from "@react-native-firebase/crashlytics";

const QuizScreen: React.FC = () => {
  const [quizState, setQuizState] = useState<QuizState>(initializeQuizState());
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [incorrectQuestions, setIncorrectQuestions] = useState<QuizQuestion[]>(
    []
  );
  const [showIncorrectQuestionsMessage, setShowIncorrectQuestionsMessage] =
    useState(false);
  const [isInIncorrectQuestionSession, setIsInIncorrectQuestionSession] =
    useState(false);
  const [correctlyAnsweredDuringSession, setCorrectlyAnsweredDuringSession] =
    useState<number[]>([]);

  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const userData = useAppSelector(selectUserData);
  const dispatch = useAppDispatch();
  const { handleAnswer: updateStats } = useData();

  const getKey = (type: string) =>
    `${type}_${userData?.id}_${getCurrentDateKey()}`;
  const QUIZ_QUESTIONS_KEY = getKey("quizQuestions");
  const QUIZ_PROGRESS_KEY = getKey("quizProgress");
  const INCORRECT_QUESTIONS_KEY = getKey("incorrectQuestions");
  const INCORRECT_PROGRESS_KEY = getKey("incorrectProgress");

  useEffect(() => {
    const initializeQuiz = async () => {
      if (userData) {
        dispatch(setLoading(true));
        try {
          console.log("Initializing quiz for user:", userData.id);
          const mainQuizProgressData = await retrieveData<{ progress: number }>(
            QUIZ_PROGRESS_KEY
          );
          const loadedQuestions = await retrieveData<QuizQuestion[]>(
            QUIZ_QUESTIONS_KEY
          );
          const incorrectQuestionsData = await retrieveData<{
            questions: QuizQuestion[];
          }>(INCORRECT_QUESTIONS_KEY);
          const incorrectQuestionsProgressData = await retrieveData<{
            progress: number;
          }>(INCORRECT_PROGRESS_KEY);
          setIncorrectQuestions(incorrectQuestionsData?.questions ?? []);

          console.log("Loaded questions:", loadedQuestions);
          const mainQuizProgress = mainQuizProgressData?.progress ?? 0;
          console.log("Main quiz progress:", mainQuizProgress);

          if (!loadedQuestions || loadedQuestions.length === 0) {
            console.log("Loading new quiz data...");
            await loadQuizData(
              userData,
              (newQuestions) => {
                setQuestions(newQuestions);
                setQuizState((prev) => ({
                  ...prev,
                  questionIndex: mainQuizProgress,
                }));
              },
              (quizStateUpdate) =>
                setQuizState((prev) => ({ ...prev, ...quizStateUpdate })),
              QUIZ_QUESTIONS_KEY,
              QUIZ_PROGRESS_KEY
            );
          } else {
            setQuestions(loadedQuestions);
            setQuizState((prev) => ({
              ...prev,
              questionIndex: mainQuizProgress,
            }));
          }

          const mainQuizCompleted =
            mainQuizProgress >= (loadedQuestions?.length ?? 0);
          console.log("Main quiz completed:", mainQuizCompleted);

          if (
            mainQuizCompleted &&
            loadedQuestions &&
            loadedQuestions.length > 0
          ) {
            if (incorrectQuestionsData?.questions.length) {
              console.log("Handling incorrect questions...");
              setQuizState((prev) => ({
                ...prev,
                questionIndex: incorrectQuestionsProgressData?.progress || 0,
                quizCompleted: false,
                showContinueButton: false,
              }));
              setShowIncorrectQuestionsMessage(true);
            } else {
              console.log("No incorrect questions to handle.");
              setQuizState((prev) => ({ ...prev, quizCompleted: true }));
            }
          }
        } catch (error) {
          console.error("Error initializing quiz:", error);
          crashlytics().recordError(error as Error);
        } finally {
          dispatch(setLoading(false));
        }
      }
    };

    initializeQuiz();
  }, [userData, dispatch]);

  useEffect(() => {
    console.log("Current quiz state:", quizState);
    console.log("Questions length:", questions.length);
    incorrectQuestions.forEach((question, index) => {
      console.log(`Incorrect Question ${index + 1}:`, question.sentenceText);
    });

    const loadQuestion = (currentQuestions: QuizQuestion[]) => {
      if (
        currentQuestions.length > 0 &&
        typeof quizState.questionIndex === "number"
      ) {
        if (quizState.questionIndex < currentQuestions.length) {
          console.log("Loading question index:", quizState.questionIndex);
          setQuizState((prev) => ({
            ...prev,
            quizCompleted: false,
            ...currentQuestions[prev.questionIndex],
            showContinueButton: false,
          }));
          crashlytics().log(`Question loaded: ${quizState.questionIndex}`);
        } else if (
          incorrectQuestions.length > 0 &&
          !isInIncorrectQuestionSession
        ) {
          setShowIncorrectQuestionsMessage(true);
        } else {
          console.log("Quiz completed");
          setQuizState((prev) => ({ ...prev, quizCompleted: true }));
          crashlytics().log("Quiz completed");
        }
      }
    };

    if (!quizState.showContinueButton) {
      if (isInIncorrectQuestionSession) {
        loadQuestion(incorrectQuestions);
      } else {
        loadQuestion(questions);
      }
    }
  }, [
    quizState.questionIndex,
    questions,
    incorrectQuestions,
    isInIncorrectQuestionSession,
    quizState.showContinueButton,
  ]);

  const handleAnswer = async (isCorrect: boolean) => {
    try {
      const timeSpent = 1;
      const nextQuestionIndex = quizState.questionIndex + 1;

      // Update progress and stats
      if (isInIncorrectQuestionSession) {
        await storeData(INCORRECT_PROGRESS_KEY, {
          progress: nextQuestionIndex,
        });
      } else {
        await storeData(QUIZ_PROGRESS_KEY, { progress: nextQuestionIndex });
      }
      await updateStats(isCorrect, timeSpent);

      let updatedIncorrectQuestions = [...incorrectQuestions];
      let updatedCorrectlyAnsweredDuringSession = [
        ...correctlyAnsweredDuringSession,
      ];

      if (!isInIncorrectQuestionSession && !isCorrect) {
        updatedIncorrectQuestions.push(questions[quizState.questionIndex]);
        setIncorrectQuestions(updatedIncorrectQuestions);
        await storeData(INCORRECT_QUESTIONS_KEY, {
          questions: updatedIncorrectQuestions,
        });
      } else if (isInIncorrectQuestionSession && isCorrect) {
        updatedCorrectlyAnsweredDuringSession.push(quizState.questionIndex);
      }

      setCorrectlyAnsweredDuringSession(updatedCorrectlyAnsweredDuringSession);

      // Update the quiz state
      setQuizState((prev) => ({
        ...prev,
        showContinueButton: true,
      }));
    } catch (error) {
      console.error("Error handling answer:", error);
      crashlytics().recordError(error as Error);
    }
  };

  const handleNextQuestion = async () => {
    console.log("Moving to next question");

    if (isInIncorrectQuestionSession) {
      const nextQuestionIndex =
        (quizState.questionIndex + 1) % incorrectQuestions.length;
      setQuizState((prev) => ({
        ...prev,
        questionIndex: nextQuestionIndex,
        showContinueButton: false,
      }));

      // If we have looped through all incorrect questions, check if all have been answered correctly
      if (nextQuestionIndex === 0) {
        // Filter out correctly answered questions from incorrectQuestions
        const remainingIncorrectQuestions = incorrectQuestions.filter(
          (_, index) => !correctlyAnsweredDuringSession.includes(index)
        );

        // If no more incorrect questions are left, end the incorrect question session
        if (remainingIncorrectQuestions.length === 0) {
          setIsInIncorrectQuestionSession(false);
          setShowIncorrectQuestionsMessage(false);
          setQuizState((prev) => ({
            ...prev,
            quizCompleted: true,
          }));
        } else {
          // Update incorrectQuestions with remaining questions
          setIncorrectQuestions(remainingIncorrectQuestions);
          await storeData(INCORRECT_QUESTIONS_KEY, {
            questions: remainingIncorrectQuestions,
          });
          setCorrectlyAnsweredDuringSession([]);
        }
      }
    } else {
      setQuizState((prev) => ({
        ...prev,
        questionIndex: prev.questionIndex + 1,
        showContinueButton: false,
      }));
    }
  };

  const handleStartButtonClick = () => {
    console.log("Start button clicked");
    setShowIncorrectQuestionsMessage(false);
    setIsInIncorrectQuestionSession(true);
    setQuizState((prev) => ({
      ...prev,
      questionIndex: 0,
    }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {showIncorrectQuestionsMessage ? (
          <View>
            <Text style={globalStyles.title}>Get Ready to Review!</Text>
            <Text style={globalStyles.subtitle}>
              Let's revisit the questions you missed. Tap the button below to
              start your review session.
            </Text>
            <CustomButton
              title="Start Reviewing"
              onPress={handleStartButtonClick}
            />
          </View>
        ) : quizState.quizCompleted ? (
          <View>
            <CompletedScreen
              title="Congratulations! You've Completed Today's Session!"
              subtitle="Return tomorrow for a new set of challenges!"
              buttonText="Go to Leaderboard"
              navigationRoute="/dashboard/leaderboard"
              showStats={true}
            />
          </View>
        ) : (
          <View>
            <BackButton />
            <Text
              style={[globalStyles.subtitle, { color: globalColors.primary }]}
            >
              {isInIncorrectQuestionSession
                ? `${quizState.questionIndex + 1} / ${
                    incorrectQuestions.length
                  } Incorrect Questions`
                : `${quizState.questionIndex + 1} / ${
                    questions.length
                  } Questions Complete`}
            </Text>

            {quizState.questionType === "multipleChoice" ||
            quizState.questionType === "trueFalse" ? (
              <MultipleChoiceQuiz
                questionText={quizState.questionText}
                sentenceText={quizState.sentenceText}
                options={quizState.options}
                correctAnswerText={quizState.correctAnswerText}
                translation={quizState.translation}
                image={quizState.image}
                questionIndex={quizState.questionIndex}
                onAnswer={handleAnswer}
              />
            ) : (
              <FillInTheBlankQuiz
                questionText={quizState.questionText}
                sentenceText={quizState.sentenceText}
                correctAnswerText={quizState.correctAnswerText}
                translation={quizState.translation}
                image={quizState.image}
                questionIndex={quizState.questionIndex}
                onAnswer={handleAnswer}
              />
            )}
            {quizState.showContinueButton && (
              <CustomButton
                title="Next Question"
                onPress={handleNextQuestion}
              />
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default QuizScreen;
