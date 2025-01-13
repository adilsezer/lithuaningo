import { useState, useEffect } from "react";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { retrieveData, storeData } from "@utils/storageUtils";
import { getCurrentDateKey } from "@utils/dateUtils";
import { SENTENCE_KEYS } from "@config/constants";
import { Sentence } from "@src/types";
import { useSentences } from "@hooks/useSentences";
import { useReminderSettings } from "@hooks/useReminderSettings";
import { cleanWord } from "@utils/stringUtils";
import { useRouter } from "expo-router";

export const useSentencesScreen = () => {
  const { sentences, loading, error } = useSentences();
  const [wordsCompleted, setWordsCompleted] = useState(false);
  const [sentencesCompleted, setSentencesCompleted] = useState(false);

  const router = useRouter();
  const userData = useAppSelector(selectUserData);
  const clickedWords = useAppSelector((state) => state.clickedWords);
  const { reminderTime, setReminderTime } = useReminderSettings(userData?.id);

  const getKey = (keyFunc: (userId: string, dateKey: string) => string) =>
    userData ? keyFunc(userData.id, getCurrentDateKey()) : "";

  const COMPLETION_STATUS_KEY = getKey(SENTENCE_KEYS.COMPLETION_STATUS_KEY);

  useEffect(() => {
    const checkCompletionStatus = async () => {
      const completionStatus = await retrieveData<boolean>(
        COMPLETION_STATUS_KEY
      );
      setSentencesCompleted(completionStatus ?? false);
    };
    checkCompletionStatus();
  }, [COMPLETION_STATUS_KEY]);

  useEffect(() => {
    if (sentences.length > 0) {
      const allWords = sentences.flatMap((sentence: Sentence) =>
        sentence.text.split(" ").map(cleanWord)
      );
      const allClicked = allWords.every((word: string) =>
        clickedWords.includes(word)
      );
      if (allClicked) {
        setWordsCompleted(true);
      }
      if (__DEV__) {
        setWordsCompleted(true);
      }
    }
  }, [sentences, clickedWords]);

  const handleProceedToQuiz = async () => {
    await storeData(COMPLETION_STATUS_KEY, true);
    setSentencesCompleted(true);

    if (reminderTime) {
      setReminderTime(reminderTime);
    }

    router.push("/learning/quiz");
  };

  const handleNavigateToDashboard = () => {
    router.push("/dashboard");
  };

  return {
    sentences,
    loading,
    error,
    wordsCompleted,
    sentencesCompleted,
    handleProceedToQuiz,
    handleNavigateToDashboard,
  };
};
