import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Alert,
  ScrollView,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import wordService, { Word } from "../services/data/wordService";
import BackButton from "./BackButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useAppDispatch } from "@src/redux/hooks";
import { setLoading } from "@src/redux/slices/uiSlice";
import CustomButton from "./CustomButton";
import { useRouter } from "expo-router";
import CustomTextInput from "./CustomTextInput";
import {
  addClickedWord,
  removeClickedWord,
} from "@src/redux/slices/clickedWordsSlice";

interface FlashcardScreenProps {
  wordId: string;
}

const FlashcardScreen: React.FC<FlashcardScreenProps> = ({ wordId }) => {
  const [word, setWord] = useState<Word | null>(null);
  const [newWord, setNewWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [wordForms, setWordForms] = useState<
    Array<{ lithuanian: string; english: string }>
  >([{ lithuanian: "", english: "" }]);
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const flip = useSharedValue(0);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flip.value, [0, 1], [0, 180]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flip.value, [0, 1], [180, 360]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
    };
  });

  const handleFlip = () => {
    flip.value = withTiming(flip.value === 0 ? 1 : 0, {
      duration: 500,
      easing: Easing.inOut(Easing.ease),
    });
  };

  const handleAddWord = async () => {
    if (newWord.trim() && translation.trim()) {
      try {
        dispatch(setLoading(true));
        const allWordForms = [{ lithuanian: newWord, english: translation }];
        // Only include additional word forms if they are filled
        wordForms.forEach((form) => {
          if (form.lithuanian.trim() && form.english.trim()) {
            allWordForms.push(form);
          }
        });

        await wordService.addWordForReview({
          id: newWord,
          wordForms: allWordForms,
          englishTranslation: translation,
          imageUrl: "",
        });
        Alert.alert(
          "Thanks for helping improve our app! Your word has been submitted for review."
        );
        setNewWord("");
        setTranslation("");
        setWordForms([{ lithuanian: "", english: "" }]);
      } catch (error) {
        console.error("Error adding word for review:", error);
        Alert.alert("Failed to submit word for review. Please try again.");
      } finally {
        dispatch(setLoading(false));
      }
    } else {
      Alert.alert(
        "Please fill in the Lithuanian word and its English translation."
      );
    }
  };

  useEffect(() => {
    const loadWord = async () => {
      try {
        dispatch(setLoading(true));
        const fetchedWords: Word[] = await wordService.fetchWords();

        const findWord = (
          wordList: Word[],
          wordToFind: string
        ): Word | undefined => {
          return wordList.find(
            (w) =>
              w.id.toLowerCase() === wordToFind.toLowerCase() ||
              w.wordForms.some(
                (form) =>
                  form.lithuanian.toLowerCase() === wordToFind.toLowerCase()
              )
          );
        };

        let selectedWord = findWord(fetchedWords, wordId);
        if (!selectedWord && wordId.toLowerCase().startsWith("ne")) {
          const wordWithoutPrefix = wordId.slice(2);
          selectedWord = findWord(fetchedWords, wordWithoutPrefix);

          if (selectedWord) {
            selectedWord = {
              ...selectedWord,
              id: wordId,
              englishTranslation: `not ${selectedWord.englishTranslation}`,
              imageUrl: "",
            };
          }
        }

        setWord(selectedWord || null);

        if (!selectedWord) {
          await wordService.addMissingWord(wordId);
        }
      } catch (error) {
        console.error("Error loading word:", error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadWord();
  }, [wordId, dispatch]);

  useEffect(() => {
    if (!word) {
      dispatch(addClickedWord(wordId));
    }
  }, [word, wordId, dispatch]);

  const handleAddWordForm = () => {
    setWordForms([...wordForms, { lithuanian: "", english: "" }]);
  };

  const handleRemoveWordForm = (index: number) => {
    const newWordForms = [...wordForms];
    newWordForms.splice(index, 1);
    setWordForms(newWordForms);
  };

  const handleWordFormChange = (
    index: number,
    field: "lithuanian" | "english",
    value: string
  ) => {
    const newWordForms = [...wordForms];
    newWordForms[index][field] = value;
    setWordForms(newWordForms);
  };

  if (!word) {
    return (
      <ScrollView>
        <BackButton />
        <Text style={globalStyles.subtitle}>
          We don't have this word in our database at the moment.
        </Text>
        <Text style={globalStyles.subtitle}>
          Help us improve by adding the word details below. Once reviewed, it
          will be available for everyone.
        </Text>
        <CustomTextInput
          placeholder="Lithuanian word (e.g., norėti)"
          value={newWord}
          onChangeText={setNewWord}
          style={styles.input}
        />
        <CustomTextInput
          placeholder="English translation (e.g., to want)"
          value={translation}
          onChangeText={setTranslation}
          style={styles.input}
        />
        <Text style={globalStyles.contrastText}>
          Enter word forms in Lithuanian and their English translations
        </Text>
        {wordForms.map((form, index) => (
          <View key={index}>
            <CustomTextInput
              placeholder="Lithuanian grammatical form (e.g., noriu)"
              value={form.lithuanian}
              onChangeText={(text) =>
                handleWordFormChange(index, "lithuanian", text)
              }
              style={styles.input}
            />
            <CustomTextInput
              placeholder="Corresponding English translation (e.g., I want)"
              value={form.english}
              onChangeText={(text) =>
                handleWordFormChange(index, "english", text)
              }
              style={styles.input}
            />
            {index > 0 && (
              <CustomButton
                title="Remove the Grammatical Form"
                onPress={() => handleRemoveWordForm(index)}
                style={{ backgroundColor: globalColors.error }}
              />
            )}
          </View>
        ))}
        <CustomButton
          title="Add Another Grammatical Form"
          onPress={handleAddWordForm}
          style={{ backgroundColor: globalColors.secondary }}
        />
        <CustomButton title="Submit" onPress={handleAddWord} />
      </ScrollView>
    );
  }

  const getEnglishTranslation = (word: Word, wordId: string): string => {
    const form = word.wordForms.find(
      (form) => form.lithuanian.toLowerCase() === wordId.toLowerCase()
    );
    return form ? form.english : word.englishTranslation;
  };

  const handleMarkButtonClick = (addWord: boolean) => {
    if (addWord) {
      dispatch(addClickedWord(wordId));
    } else {
      dispatch(removeClickedWord(wordId));
    }
    router.back();
  };

  return (
    <View>
      <TouchableWithoutFeedback onPress={handleFlip}>
        <View style={styles.cardContainer}>
          <Animated.View
            style={[
              styles.card,
              frontAnimatedStyle,
              { backgroundColor: globalColors.card },
            ]}
          >
            <Text style={[globalStyles.contrastTitle]}>{wordId}</Text>
            <View
              style={[
                styles.horizontalRule,
                { borderBottomColor: globalColors.border },
              ]}
            />
            {word.wordForms &&
              word.wordForms.some((form) => form.lithuanian !== word.id) && (
                <View>
                  <Text style={[globalStyles.contrastSubtitle]}>
                    Word Forms:
                  </Text>
                  {word.wordForms.map(
                    (form, index) =>
                      form.lithuanian !== wordId && (
                        <View
                          key={index}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 4,
                          }}
                        >
                          <Text style={[globalStyles.contrastSubtitle]}>•</Text>
                          <Text
                            style={[
                              globalStyles.contrastSubtitle,
                              { marginLeft: 8, flexShrink: 1 },
                            ]}
                          >
                            {form.lithuanian}
                          </Text>
                        </View>
                      )
                  )}
                </View>
              )}
          </Animated.View>
          <Animated.View
            style={[
              styles.card,
              backAnimatedStyle,
              styles.cardBack,
              { backgroundColor: globalColors.card },
            ]}
          >
            <Text style={[globalStyles.contrastTitle]}>
              {getEnglishTranslation(word, wordId)}
            </Text>
            <View
              style={[
                styles.horizontalRule,
                { borderBottomColor: globalColors.border },
              ]}
            />
            {word.wordForms &&
              word.wordForms.some((form) => form.lithuanian !== word.id) && (
                <View>
                  <Text style={[globalStyles.contrastSubtitle]}>
                    Word Forms:
                  </Text>
                  {word.wordForms.map(
                    (form, index) =>
                      form.lithuanian !== wordId && (
                        <View
                          key={index}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 4,
                          }}
                        >
                          <Text style={[globalStyles.contrastSubtitle]}>•</Text>
                          <Text
                            style={[
                              globalStyles.contrastSubtitle,
                              { marginLeft: 8, flexShrink: 1 },
                            ]}
                          >
                            <Text style={{ fontFamily: "Roboto-Bold" }}>
                              {form.lithuanian}
                            </Text>
                            {`: ${form.english}`}
                          </Text>
                        </View>
                      )
                  )}
                </View>
              )}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
      <Text style={[globalStyles.subtitle]}>
        Tap the card to flip and see the translation
      </Text>
      <CustomButton
        title="Review Later"
        style={[styles.button, { backgroundColor: globalColors.secondary }]}
        onPress={() => handleMarkButtonClick(false)}
      />
      <CustomButton
        title="Mark as Known"
        onPress={() => handleMarkButtonClick(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: "relative",
    width: "90%",
    height: "60%",
    alignSelf: "center",
  },
  card: {
    justifyContent: "center",
    alignItems: "center",
    backfaceVisibility: "hidden",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "90%",
    borderRadius: 20,
    borderWidth: 0.5,
  },
  cardBack: {
    transform: [{ rotateY: "180deg" }],
  },
  imageContainer: {
    width: "100%",
    height: "80%",
    paddingHorizontal: 15,
    marginVertical: 5,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    borderWidth: 0.5,
  },
  input: {
    marginVertical: 10,
  },
  button: {
    marginTop: 50,
  },
  horizontalRule: {
    width: "80%",
    alignSelf: "center",
    borderBottomWidth: 1,
    marginVertical: 10,
  },
});

export default FlashcardScreen;
