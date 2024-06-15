import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import sentenceService, { Sentence } from "../../services/data/sentenceService";
import userProfileService from "../../services/data/userProfileService";
import BackButton from "@components/BackButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useAppSelector, useAppDispatch } from "@src/redux/hooks";
import { selectUserData } from "@src/redux/slices/userSlice";
import { addClickedWord } from "@src/redux/slices/clickedWordsSlice";
import CustomButton from "@components/CustomButton";
import { selectIsLoading, setLoading } from "@src/redux/slices/uiSlice";

const LearningScreen: React.FC = () => {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [allWordsClicked, setAllWordsClicked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const userData = useAppSelector(selectUserData);
  const clickedWords = useAppSelector((state) => state.clickedWords);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const loadSentencesAndWords = async () => {
      if (!userData?.id) return;

      dispatch(setLoading(true)); // Dispatch loading true
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
              sentence.is_main_sentence &&
              !learnedSentenceIds.includes(sentence.id)
          )
          .slice(0, 2);

        setSentences(filteredSentences);
      } catch (error) {
        console.error("Error loading sentences and words:", error);
        setError("Failed to load sentences. Please try again later.");
      } finally {
        dispatch(setLoading(false)); // Dispatch loading false
      }
    };

    loadSentencesAndWords();
  }, [userData]);

  useEffect(() => {
    if (sentences.length > 0) {
      const allWords = sentences.flatMap((sentence) =>
        sentence.sentence.split(" ")
      );
      const allClicked = allWords.every((word) => clickedWords.includes(word));
      setAllWordsClicked(allClicked);
    }
  }, [sentences, clickedWords]);

  const handleWordClick = (word: string) => {
    dispatch(addClickedWord(word));
    router.push(`/flashcard/${word}`);
  };

  if (error) {
    return (
      <Text style={[globalStyles.text, { color: globalColors.error }]}>
        {error}
      </Text>
    );
  }

  if (sentences.length === 0) {
    return (
      <Text style={globalStyles.text}>
        No new sentences to learn. Please check back later.
      </Text>
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
      {allWordsClicked ? (
        <View style={styles.allWordsClickedSection}>
          <Text style={globalStyles.subtitle}>
            Good job reviewing the cards!
          </Text>
          <CustomButton
            title="Ready to take the test?"
            onPress={() => router.push("/quiz")}
          />
        </View>
      ) : (
        <Text style={[globalStyles.subtitle, styles.allWordsClickedSection]}>
          Click all words to unlock the proceed button.
        </Text>
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
    borderRadius: 8, // Rounded edges for a modern look
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  wordText: {
    fontSize: 20, // Slightly larger font for readability
  },
  allWordsClickedSection: {
    marginVertical: 40,
  },
});

export default LearningScreen;
