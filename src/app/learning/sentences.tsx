import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import sentenceService, { Sentence } from "../../services/data/sentenceService";
import userProfileService from "../../services/data/userProfileService";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useAppSelector, useAppDispatch } from "@src/redux/hooks";
import { selectUserData } from "@src/redux/slices/userSlice";
import { addClickedWord } from "@src/redux/slices/clickedWordsSlice";
import CustomButton from "@components/CustomButton";
import { setLoading } from "@src/redux/slices/uiSlice";
import CompletedScreen from "@components/CompletedScreen";
import { retrieveData, storeData } from "@utils/storageUtil";
import BackButton from "@components/BackButton";
import { getCurrentDateKey } from "@utils/dateUtils";

const SentencesScreen: React.FC = () => {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const router = useRouter();
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const userData = useAppSelector(selectUserData);
  const clickedWords = useAppSelector((state) => state.clickedWords);
  const dispatch = useAppDispatch();

  const COMPLETION_STATUS_KEY = `completionStatus-${getCurrentDateKey()}`;

  useEffect(() => {
    const checkCompletionStatus = async () => {
      const completionStatus = await retrieveData<boolean>(
        COMPLETION_STATUS_KEY
      );
      setCompleted(completionStatus ?? false);
    };
    checkCompletionStatus();
  }, []);

  useEffect(() => {
    const loadSentencesAndWords = async () => {
      if (!userData?.id) return;

      dispatch(setLoading(true));
      try {
        const [fetchedSentences, userProfile] = await Promise.all([
          sentenceService.fetchSentences(),
          userProfileService.fetchUserProfile(userData.id),
        ]);

        const learnedSentenceIds: string[] =
          userProfile?.learnedSentences || [];

        const filteredSentences = fetchedSentences
          .filter(
            (sentence: Sentence) =>
              sentence.isMainSentence &&
              !learnedSentenceIds.includes(sentence.id)
          )
          .slice(0, 2);

        setSentences(filteredSentences);
      } catch (error) {
        console.error("Error loading sentences and words:", error);
        setError("Failed to load sentences. Please try again later.");
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadSentencesAndWords();
  }, [userData, dispatch]);

  useEffect(() => {
    if (sentences.length > 0) {
      const allWords = sentences.flatMap((sentence) =>
        sentence.sentence.split(" ")
      );
      const allClicked = allWords.every((word) => clickedWords.includes(word));
      if (allClicked) {
        storeData(COMPLETION_STATUS_KEY, true);
        handleReadyToTest();
        setCompleted(true);
      }
    }
  }, [sentences, clickedWords]);

  const handleWordClick = (word: string) => {
    dispatch(addClickedWord(word));
    router.push(`/learning/${word}`);
  };

  const handleReadyToTest = async () => {
    if (!userData?.id) return;

    const sentenceIds = sentences.map((sentence) => sentence.id);
    try {
      await userProfileService.updateUserLearnedSentences(
        userData.id,
        sentenceIds
      );
    } catch (error) {
      console.error("Error updating learned sentences:", error);
    }
  };

  if (completed) {
    return (
      <View>
        <CompletedScreen
          displayText="Good job reviewing all the words today!"
          buttonText="Ready to take the test?"
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
                  backgroundColor: clickedWords.includes(word)
                    ? globalColors.wordHighlightBackground
                    : globalColors.wordBackground,
                },
              ]}
            >
              <Text style={[globalStyles.text, styles.wordText]}>{word} </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      <Text style={[globalStyles.subtitle, styles.allWordsClickedSection]}>
        Click all words to unlock the proceed button.
      </Text>
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
  },
  wordText: {
    fontSize: 20,
  },
  allWordsClickedSection: {
    marginVertical: 40,
  },
});

export default SentencesScreen;
