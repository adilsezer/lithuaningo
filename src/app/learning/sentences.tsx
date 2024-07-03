import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import sentenceService, { Sentence } from "../../services/data/sentenceService";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useAppSelector, useAppDispatch } from "@src/redux/hooks";
import { selectUserData } from "@src/redux/slices/userSlice";
import { addClickedWord } from "@src/redux/slices/clickedWordsSlice";
import CustomButton from "@components/CustomButton";
import { setLoading } from "@src/redux/slices/uiSlice";
import BackButton from "@components/BackButton";
import { getCurrentDateKey } from "@utils/dateUtils";
import { retrieveData, storeData } from "@utils/storageUtil";
import CompletedScreen from "@components/CompletedScreen";

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

  const COMPLETION_STATUS_KEY = `completionStatus-${getCurrentDateKey()}`;
  const SENTENCES_KEY = `sentences-${getCurrentDateKey()}`;

  const { width } = Dimensions.get("window");
  const isTablet = (Platform.OS === "ios" && Platform.isPad) || width >= 768;

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
        // Check if sentences are already stored
        const storedSentences = await retrieveData<Sentence[]>(SENTENCES_KEY);

        if (storedSentences && storedSentences.length > 0) {
          setSentences(storedSentences);
        } else {
          const fetchedSentences = await sentenceService.fetchSentences();
          const selectedSentences = fetchedSentences.slice(0, 2);

          setSentences(selectedSentences);

          // Store the fetched sentences
          await storeData(SENTENCES_KEY, selectedSentences);
        }
      } catch (error) {
        console.error("Error loading sentences and words:", error);
        setError("Failed to load sentences. Please try again later.");
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadSentencesAndWords();
  }, [userData, dispatch]);

  const cleanWord = (word: string) => {
    return word.replace(/[.,!?;:()"]/g, "");
  };

  useEffect(() => {
    if (sentences.length > 0) {
      const allWords = sentences.flatMap((sentence) =>
        sentence.sentence.split(" ").map(cleanWord)
      );
      const allClicked = allWords.every((word) => clickedWords.includes(word));
      if (allClicked) {
        setWordsCompleted(true);
      }
    }
  }, [sentences, clickedWords]);

  const handleWordClick = (word: string) => {
    const cleanedWord = cleanWord(word);
    dispatch(addClickedWord(cleanedWord));
    router.push(`/learning/${cleanedWord}`);
  };

  const handleProceedToQuiz = async () => {
    storeData(COMPLETION_STATUS_KEY, true);
    setSentencesCompleted(true);
    router.push("/learning/quiz");
  };

  if (error) {
    return (
      <View>
        <BackButton />
        <Text style={[globalStyles.text, { color: globalColors.error }]}>
          {error}
        </Text>
      </View>
    );
  }

  if (sentencesCompleted) {
    return (
      <View>
        <CompletedScreen
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
      </View>
    );
  }

  if (sentences.length === 0) {
    return (
      <View>
        <BackButton />
        <Text style={globalStyles.text}>
          No new sentences to learn. Please check back later.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <BackButton />
      <Text style={globalStyles.title}>
        Today you will learn the following sentences.
      </Text>
      <Text style={globalStyles.subtitle}>
        Click on each word to find out what it means.
      </Text>
      {sentences.map((sentence) => (
        <View key={sentence.id} style={styles.sentenceContainer}>
          {sentence.sentence.split(" ").map((word: string, index: number) => (
            <TouchableOpacity
              key={`${word}-${index}`}
              onPress={() => handleWordClick(word)}
              style={[
                styles.wordContainer,
                {
                  backgroundColor: clickedWords.includes(cleanWord(word))
                    ? globalColors.wordHighlightBackground
                    : globalColors.wordBackground,
                },
              ]}
            >
              <Text
                style={[
                  globalStyles.text,
                  styles.wordText,
                  isTablet && styles.wordTextIpad,
                ]}
              >
                {word}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      {!wordsCompleted && (
        <Text style={[globalStyles.subtitle, styles.allWordsClickedSection]}>
          Click all words to unlock the proceed button.
        </Text>
      )}
      {wordsCompleted && (
        <CustomButton
          title="Proceed to Quiz"
          onPress={handleProceedToQuiz}
          style={{ marginVertical: 60 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sentenceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 5,
    marginHorizontal: 20,
    alignSelf: "center",
    justifyContent: "center",
  },
  wordContainer: {
    marginHorizontal: 6,
    marginVertical: 6,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    minHeight: 40,
    minWidth: 50,
  },
  wordText: {
    fontSize: 20,
    textAlign: "center",
  },
  wordTextIpad: {
    fontSize: 30, // Larger font size for iPad
  },
  allWordsClickedSection: {
    marginVertical: 60,
  },
});

export default SentencesScreen;
