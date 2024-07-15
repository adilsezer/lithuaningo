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
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const userData = useAppSelector(selectUserData);
  const dispatch = useAppDispatch();
  const { handleAnswer: updateStats } = useData();
  const [resetKey, setResetKey] = useState(0);
  const [isHandlingIncorrectQuestions, setIsHandlingIncorrectQuestions] =
    useState<boolean>(false);
  const [showStartMessage, setShowStartMessage] = useState<boolean>(false);
  const [isMainQuizCompleted, setIsMainQuizCompleted] =
    useState<boolean>(false);

  const QUIZ_PROGRESS_KEY = `quizProgress_${
    userData?.id
  }_${getCurrentDateKey()}`;
  const INCORRECT_QUESTIONS_KEY = `incorrectQuestions_${
    userData?.id
  }_${getCurrentDateKey()}`;

  useEffect(() => {
    const initializeQuiz = async () => {
      if (userData) {
        dispatch(setLoading(true));
        try {
          await loadQuizData(
            userData,
            setQuestions,
            setQuizState,
            QUIZ_PROGRESS_KEY
          );
          const mainQuizProgressData = await retrieveData<{ progress: number }>(
            QUIZ_PROGRESS_KEY
          );
          setIsMainQuizCompleted(
            (mainQuizProgressData?.progress ?? 0) >= questions.length
          );
        } finally {
          dispatch(setLoading(false));
        }
      }
    };

    initializeQuiz();
  }, [userData, dispatch]);

  useEffect(() => {
    const loadIncorrectQuestions = async () => {
      const incorrectQuestionsRecord = await retrieveData<{
        questions: QuizQuestion[];
        progress: number;
      }>(INCORRECT_QUESTIONS_KEY);

      if (
        incorrectQuestionsRecord &&
        incorrectQuestionsRecord.questions.length > 0
      ) {
        setQuestions(incorrectQuestionsRecord.questions);
        setQuizState((prev: QuizState) => ({
          ...prev,
          questionIndex: incorrectQuestionsRecord.progress || 0,
          quizCompleted: false,
        }));
        setIsHandlingIncorrectQuestions(true);
      }
    };

    if (isMainQuizCompleted) {
      loadIncorrectQuestions();
    }
  }, [isMainQuizCompleted]);

  useEffect(() => {
    if (questions.length > 0 && quizState.questionIndex < questions.length) {
      setQuizState((prev: QuizState) => {
        const newState = {
          ...prev,
          quizCompleted: false,
          ...questions[prev.questionIndex],
        };
        return newState;
      });
      crashlytics().log(`Question loaded: ${quizState.questionIndex}`);
    } else if (questions.length > 0) {
      setQuizState((prev: QuizState) => {
        const newState = { ...prev, quizCompleted: true };
        return newState;
      });
      crashlytics().log("Quiz completed");
    }
  }, [quizState.questionIndex, questions, resetKey]);

  const handleAnswer = async (isCorrect: boolean) => {
    const timeSpent = 1;
    try {
      if (!isHandlingIncorrectQuestions) {
        await updateStats(isCorrect, timeSpent);
      }
      crashlytics().log(`Answer submitted: ${isCorrect}`);

      if (!isCorrect) {
        const currentQuestion = questions[quizState.questionIndex];
        let incorrectQuestionsData = await retrieveData<{
          questions: QuizQuestion[];
          progress: number;
        }>(INCORRECT_QUESTIONS_KEY);
        if (!incorrectQuestionsData) {
          incorrectQuestionsData = { questions: [], progress: 0 };
        }
        incorrectQuestionsData.questions.push(currentQuestion);
        await storeData(INCORRECT_QUESTIONS_KEY, incorrectQuestionsData);
        crashlytics().log(
          `Incorrect question stored: ${JSON.stringify(currentQuestion)}`
        );
      }

      const progressKey = isHandlingIncorrectQuestions
        ? INCORRECT_QUESTIONS_KEY
        : QUIZ_PROGRESS_KEY;
      let progressData = await retrieveData<{
        questions: QuizQuestion[];
        progress: number;
      }>(progressKey);
      if (!progressData) {
        progressData = { questions: [], progress: 0 };
      }
      progressData.progress = quizState.questionIndex + 1;
      await storeData(progressKey, progressData);

      setQuizState((prev: QuizState) => {
        const newState = { ...prev, showContinueButton: true };
        return newState;
      });
    } catch (error) {
      crashlytics().recordError(error as Error);
      console.error("Error updating stats:", error);
    }
  };

  const handleNextQuestion = async () => {
    let incorrectQuestionsData = await retrieveData<{
      questions: QuizQuestion[];
      progress: number;
    }>(INCORRECT_QUESTIONS_KEY);

    crashlytics().log(
      `Next question: Current Index ${quizState.questionIndex}, Questions Length: ${questions.length}`
    );

    if (quizState.questionIndex < questions.length - 1) {
      setQuizState((prev: QuizState) => {
        const newState = {
          ...prev,
          questionIndex: quizState.questionIndex + 1,
          showContinueButton: false,
        };
        return newState;
      });
    } else if (
      incorrectQuestionsData &&
      incorrectQuestionsData.questions.length > 0
    ) {
      crashlytics().log(
        `Repeating incorrect questions: ${JSON.stringify(
          incorrectQuestionsData.questions
        )}`
      );

      // Re-initializing the quiz state for incorrect questions
      setQuestions([...incorrectQuestionsData.questions]);
      setQuizState((prev: QuizState) => {
        const newState = {
          ...initializeQuizState(),
          questionIndex: incorrectQuestionsData.progress || 0,
          quizCompleted: false,
        };
        return newState;
      });
      setIsHandlingIncorrectQuestions(true);
      setShowStartMessage(true);
      setResetKey((prev) => prev + 1); // Trigger a re-render by updating the resetKey
    } else {
      setQuizState((prev: QuizState) => {
        const newState = { ...prev, quizCompleted: true };
        return newState;
      });
    }
  };

  useEffect(() => {
    crashlytics().log("Quiz screen loaded.");
  }, []);

  const handleStartButtonClick = () => {
    setShowStartMessage(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView key={resetKey} contentContainerStyle={{ flexGrow: 1 }}>
        {showStartMessage ? (
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
              {quizState.questionIndex + 1} / {questions.length} Questions
              Complete
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
