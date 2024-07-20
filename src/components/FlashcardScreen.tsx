import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Alert,
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
  const [grammaticalForms, setGrammaticalForms] = useState<string>("");
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
    if (newWord.trim() && translation.trim() && grammaticalForms.trim()) {
      try {
        dispatch(setLoading(true));
        await wordService.addWordForReview({
          id: newWord,
          grammaticalForms: grammaticalForms
            .split(",")
            .map((form) => form.trim()),
          englishTranslation: translation,
          imageUrl: "",
        });
        Alert.alert(
          "Thanks for helping improve our app! Your word has been submitted for review."
        );
        setNewWord("");
        setTranslation("");
        setGrammaticalForms("");
      } catch (error) {
        console.error("Error adding word for review:", error);
        Alert.alert("Failed to submit word for review. Please try again.");
      } finally {
        dispatch(setLoading(false));
      }
    } else {
      Alert.alert("Please fill in all fields.");
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
              w.grammaticalForms.some(
                (form) => form.toLowerCase() === wordToFind.toLowerCase()
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

  if (!word) {
    return (
      <View>
        <BackButton />
        <Text style={globalStyles.subtitle}>
          We don't have this word in our database at the moment.
        </Text>
        <Text style={globalStyles.subtitle}>
          Help us improve by adding the word details below. Once reviewed, it
          will be available for everyone.
        </Text>
        <CustomTextInput
          placeholder="Lithuanian word"
          value={newWord}
          onChangeText={setNewWord}
          style={styles.input}
        />
        <CustomTextInput
          placeholder="English translation"
          value={translation}
          onChangeText={setTranslation}
          style={styles.input}
        />
        <CustomTextInput
          placeholder="Grammatical forms (e.g., noriu, norėti, norėjo)"
          value={grammaticalForms}
          onChangeText={setGrammaticalForms}
          style={styles.input}
        />
        <Text style={globalStyles.contrastText}>
          Please enter grammatical forms separated by commas.
        </Text>
        <CustomButton title="Submit" onPress={handleAddWord} />
      </View>
    );
  }

  const handleMarkButtonClick = (addWord: boolean) => {
    if (addWord) {
      dispatch(addClickedWord(wordId));
    } else {
      dispatch(removeClickedWord(wordId));
    }
    router.back();
  };

  const explainGrammaticalForms = (form: string, isVerb: boolean): string => {
    const verbEndingsMap = [
      // Present Tense
      { ending: "u", translation: "(I present)" },
      { ending: "i", translation: "(you sing. present)" },
      { ending: "a", translation: "(he/she/it present)" },
      { ending: "ame", translation: "(we present)" },
      { ending: "ate", translation: "(you pl. present)" },
      { ending: "a", translation: "(they present)" },
      // Past Tense
      { ending: "au", translation: "(I past)" },
      { ending: "ai", translation: "(you sing. past)" },
      { ending: "o", translation: "(he/she/it past)" },
      { ending: "ome", translation: "(we past)" },
      { ending: "ote", translation: "(you pl. past)" },
      { ending: "o", translation: "(they past)" },
      // Future Tense
      { ending: "siu", translation: "(I future)" },
      { ending: "si", translation: "(you sing. future)" },
      { ending: "s", translation: "(he/she/it future)" },
      { ending: "sime", translation: "(we future)" },
      { ending: "site", translation: "(you pl. future)" },
      { ending: "s", translation: "(they future)" },
      // Conditional
      { ending: "čiau", translation: "(I would)" },
      { ending: "tum", translation: "(you sing. would)" },
      { ending: "tų", translation: "(he/she/it would)" },
      { ending: "tume", translation: "(we would)" },
      { ending: "tumėte", translation: "(you pl. would)" },
      { ending: "tų", translation: "(they would)" },
      // Participles
      { ending: "damas", translation: "(he -ing)" },
      { ending: "dama", translation: "(she -ing)" },
      { ending: "damieji", translation: "(they masc. -ing)" },
      { ending: "damosios", translation: "(they fem. -ing)" },
      { ending: "ęs", translation: "(having masc.)" },
      { ending: "usi", translation: "(having fem.)" },
      { ending: "ęsi", translation: "(having fem. pl.)" },
      // Imperative
      { ending: "k", translation: "(you sing. imperative)" },
      { ending: "kite", translation: "(you pl. imperative)" },
    ];

    const nounEndingsMap = [
      // Singular Noun Endings
      { ending: "as", translation: "(masc. nom. sing.)" },
      { ending: "is", translation: "(masc. nom. sing.)" },
      { ending: "ys", translation: "(masc. nom. sing.)" },
      { ending: "a", translation: "(fem. nom. sing.)" },
      { ending: "ė", translation: "(fem. nom. sing.)" },
      { ending: "ą", translation: "(acc. sing.)" },
      { ending: "ę", translation: "(acc. sing.)" },
      { ending: "o", translation: "(gen. sing. - of)" },
      { ending: "ės", translation: "(gen. sing. - of)" },
      { ending: "ui", translation: "(dat. sing. - to)" },
      { ending: "iai", translation: "(dat. sing. - to)" },
      { ending: "į", translation: "(acc. sing. - to)" },
      { ending: "uje", translation: "(loc. sing. - in/at)" },
      { ending: "ėje", translation: "(loc. sing. - in/at)" },
      { ending: "yje", translation: "(loc. sing. - in/at)" }, // Added for "salis"
      { ending: "imi", translation: "(inst. sing. - with/by)" },
      { ending: "umi", translation: "(inst. sing. - with/by)" },
      // Plural Noun Endings
      { ending: "ai", translation: "(masc. nom. pl.)" },
      { ending: "ys", translation: "(masc. nom. pl.)" },
      { ending: "os", translation: "(fem. nom. pl./gen. pl. - of)" },
      { ending: "ios", translation: "(fem. nom. pl.)" },
      { ending: "es", translation: "(fem. nom. pl.)" },
      { ending: "us", translation: "(acc. pl. masc.)" },
      { ending: "as", translation: "(acc. pl. fem.)" },
      { ending: "ių", translation: "(gen. pl. - of)" },
      { ending: "ų", translation: "(gen. pl. - of)" },
      { ending: "omis", translation: "(inst. pl. - with/by)" },
      { ending: "imis", translation: "(inst. pl. - with/by)" },
      { ending: "iais", translation: "(inst. pl. - with/by)" },
      { ending: "uose", translation: "(loc. pl. - in/at)" },
      { ending: "iuose", translation: "(loc. pl. - in/at)" },
      { ending: "ėse", translation: "(loc. pl. - in/at)" },
      // Adjective Endings
      { ending: "us", translation: "(masc. adj. nom. sing.)" },
      { ending: "i", translation: "(fem. adj. nom. sing.)" },
      { ending: "ius", translation: "(masc. adj. nom. pl.)" },
      { ending: "ios", translation: "(fem. adj. nom. pl.)" },
      { ending: "ų", translation: "(gen. adj. sing. masc. - of)" },
      { ending: "ių", translation: "(gen. adj. pl. - of)" },
      { ending: "am", translation: "(dat. adj. sing. masc. - to)" },
      { ending: "iam", translation: "(dat. adj. sing. fem. - to)" },
      { ending: "ąją", translation: "(acc. adj. sing. fem.)" },
      { ending: "uoju", translation: "(inst. adj. sing. masc. - with/by)" },
      { ending: "ąja", translation: "(inst. adj. sing. fem. - with/by)" },
      { ending: "uosius", translation: "(acc. adj. pl. masc.)" },
      { ending: "osioms", translation: "(dat. adj. pl. fem. - to)" },
      // Locative Endings
      { ending: "oje", translation: "(loc. sing. - in/at)" },
      { ending: "ėje", translation: "(loc. sing. - in/at)" },
      { ending: "yje", translation: "(loc. sing. - in/at)" }, // Added for "salis"
      { ending: "uose", translation: "(loc. pl. - in/at)" },
      { ending: "iuose", translation: "(loc. pl. - in/at)" },
    ];

    const endingsMap = isVerb ? verbEndingsMap : nounEndingsMap;

    // Sort endings by length in descending order to ensure specific matches first
    endingsMap.sort((a, b) => b.ending.length - a.ending.length);

    for (const { ending, translation } of endingsMap) {
      if (form.endsWith(ending)) {
        return `${form} ${translation}`;
      }
    }
    return `${form}`;
  };

  const determineIfVerb = (englishTranslation: string): boolean => {
    return englishTranslation.toLowerCase().startsWith("to ");
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
            <Text style={[globalStyles.contrastTitle, { marginLeft: 8 }]}>
              {word.id}
            </Text>
            <View
              style={[
                styles.horizontalRule,
                { borderBottomColor: globalColors.border },
              ]}
            />
            {word.grammaticalForms &&
              word.grammaticalForms.some((form) => form !== word.id) && (
                <View>
                  <Text style={[globalStyles.contrastSubtitle]}>Variants:</Text>
                  {word.grammaticalForms.map(
                    (form, index) =>
                      form !== word.id && (
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
                            {explainGrammaticalForms(
                              form,
                              determineIfVerb(word.englishTranslation)
                            )}
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
              {word.englishTranslation}
            </Text>
            <View
              style={[
                styles.horizontalRule,
                { borderBottomColor: globalColors.border },
              ]}
            />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
      <Text style={[globalStyles.subtitle]}>
        Tap the card to flip and see the translation
      </Text>
      <CustomButton
        title="Mark as Known"
        onPress={() => handleMarkButtonClick(true)}
        style={styles.button}
      />
      <CustomButton
        title="Review Later"
        style={{ backgroundColor: globalColors.secondary }}
        onPress={() => handleMarkButtonClick(false)}
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
