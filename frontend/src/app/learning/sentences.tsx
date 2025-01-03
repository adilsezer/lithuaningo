import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAppSelector, useAppDispatch } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import CustomButton from "@components/ui/CustomButton";
import { setLoading } from "@redux/slices/uiSlice";
import BackButton from "@components/layout/BackButton";
import { getCurrentDateKey } from "@utils/dateUtils";
import { retrieveData, storeData } from "@utils/storageUtils";
import CompletedLayout from "@components/learning/CompletedLayout";
import { cleanWord } from "@utils/stringUtils";
import RenderClickableWords from "@components/learning/RenderClickableWords";
import crashlytics from "@react-native-firebase/crashlytics";
import { scheduleDailyReviewReminder } from "@services/notification/notificationService";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { SENTENCE_KEYS } from "@config/constants";
import { Sentence } from "@src/types";
import sentenceService from "@services/data/sentenceService";

const SentencesScreen: React.FC = () => {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [wordsCompleted, setWordsCompleted] = useState(false);
  const [sentencesCompleted, setSentencesCompleted] = useState(false);
  const router = useRouter();
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const userData = useAppSelector(selectUserData);
  const clickedWords = useAppSelector((state) => state.clickedWords);
  const dispatch = useAppDispatch();

  const getKey = (keyFunc: (userId: string, dateKey: string) => string) =>
    userData ? keyFunc(userData.id, getCurrentDateKey()) : "";

  const COMPLETION_STATUS_KEY = getKey(SENTENCE_KEYS.COMPLETION_STATUS_KEY);
  const SENTENCES_KEY = getKey(SENTENCE_KEYS.SENTENCES_KEY);

  useEffect(() => {
    const checkCompletionStatus = async () => {
      const completionStatus = await retrieveData<boolean>(
        COMPLETION_STATUS_KEY
      );
      setSentencesCompleted(completionStatus ?? false);
    };
    checkCompletionStatus();
  }, []);

  useEffect(() => {
    const loadSentencesAndWords = async () => {
      if (!userData?.id) return;

      dispatch(setLoading(true));
      try {
        const storedSentences = await retrieveData<Sentence[]>(SENTENCES_KEY);

        if (storedSentences && storedSentences.length > 0) {
          setSentences(storedSentences);
        } else {
          const fetchedSentences = await sentenceService.fetchSentences(
            userData?.id
          );
          const firstTwoSentences = fetchedSentences.slice(0, 2);

          setSentences(firstTwoSentences);

          await storeData(SENTENCES_KEY, firstTwoSentences);
        }
      } catch (error: unknown) {
        console.error("Error loading sentences and words:", error);
        crashlytics().recordError(error as Error);
        setError("Failed to load sentences. Please try again later.");
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadSentencesAndWords();
  }, [userData, dispatch]);

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
    await scheduleDailyReviewReminder(userData?.id, new Date(), true);
    router.push("/learning/quiz");
  };

  useEffect(() => {
    crashlytics().log("Sentences screen loaded.");
  }, []);

  if (error) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <BackButton />
        <Text style={[globalStyles.text, { color: globalColors.error }]}>
          {error}
        </Text>
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
          onPress={() => {
            router.push("/dashboard");
          }}
        />
      </ScrollView>
    );
  }

  if (sentences.length === 0) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <BackButton />
        <Text style={globalStyles.text}>
          No new sentences to learn. Please check back later.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <BackButton />
      <Text style={globalStyles.title}>
        Let's review today's vocabulary before practice!
      </Text>
      <Text style={globalStyles.subtitle}>
        Click on each word to find out what it means.
      </Text>
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
                  { borderBottomColor: globalColors.border },
                ]}
              />
            )}
          </View>
        ))}
        {!wordsCompleted && (
          <Text style={[globalStyles.subtitle, styles.allWordsClickedSection]}>
            Click all words to unlock the proceed button.
          </Text>
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
  container: {
    flex: 1,
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
