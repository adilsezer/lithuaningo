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

  const verbEndingsMap = [
    { ending: "u", description: "present 1st sing." },
    {
      ending: "i",
      description: "present 2nd sing.",
    },
    {
      ending: "a",
      description: "present 3rd sing.",
    },
    {
      ending: "ame",
      description: "present 1st pl.",
    },
    {
      ending: "ate",
      description: "present 2nd pl.",
    },
    {
      ending: "a",
      description: "present 3rd pl.",
    },
    { ending: "au", description: "past 1st sing." },
    {
      ending: "ai",
      description: "past 2nd sing.",
    },
    {
      ending: "o",
      description: "past 3rd sing.",
    },
    { ending: "ome", description: "past 1st pl." },
    {
      ending: "ote",
      description: "past 2nd pl.",
    },
    { ending: "o", description: "past 3rd pl." },
    {
      ending: "siu",
      description: "future 1st sing.",
    },
    {
      ending: "si",
      description: "future 2nd sing.",
    },
    {
      ending: "s",
      description: "future 3rd sing.",
    },
    {
      ending: "sime",
      description: "future 1st pl.",
    },
    {
      ending: "site",
      description: "future 2nd pl.",
    },
    {
      ending: "s",
      description: "future 3rd pl.",
    },
    {
      ending: "čiau",
      description: "cond. 1st sing.",
    },
    {
      ending: "tum",
      description: "cond. 2nd sing.",
    },
    {
      ending: "tų",
      description: "cond. 3rd sing.",
    },
    {
      ending: "tume",
      description: "cond. 1st pl.",
    },
    {
      ending: "tumėte",
      description: "cond. 2nd pl.",
    },
    {
      ending: "tų",
      description: "cond. 3rd pl.",
    },
    {
      ending: "damas",
      description: "pres. part. masc.",
    },
    {
      ending: "dama",
      description: "pres. part. fem.",
    },
    {
      ending: "damieji",
      description: "pres. part. masc. pl.",
    },
    {
      ending: "damosios",
      description: "pres. part. fem. pl.",
    },
    {
      ending: "ęs",
      description: "past part. masc.",
    },
    {
      ending: "usi",
      description: "past part. fem.",
    },
    {
      ending: "ęsi",
      description: "past part. fem. pl.",
    },
    {
      ending: "k",
      description: "imper. 2nd sing.",
    },
    {
      ending: "kite",
      description: "imper. 2nd pl.",
    },
  ];

  const nounEndingsMap = [
    { ending: "as", description: "masc. nom. sing." },
    { ending: "is", description: "masc. nom. sing." },
    { ending: "ys", description: "masc. nom. sing." },
    { ending: "a", description: "fem. nom. sing." },
    { ending: "ė", description: "fem. nom. sing." },
    { ending: "ą", description: "acc. sing." },
    { ending: "ę", description: "acc. sing." },
    { ending: "o", description: "gen. sing." },
    { ending: "ės", description: "gen. sing." },
    { ending: "ui", description: "dat. sing." },
    { ending: "iai", description: "dat. sing." },
    { ending: "į", description: "acc. sing." },
    { ending: "uje", description: "loc. sing." },
    { ending: "ėje", description: "loc. sing." },
    { ending: "yje", description: "loc. sing." },
    {
      ending: "imi",
      description: "inst. sing.",
    },
    {
      ending: "umi",
      description: "inst. sing.",
    },
    { ending: "ai", description: "masc. nom. pl." },
    { ending: "ys", description: "masc. nom. pl." },
    { ending: "os", description: "fem. nom. pl." },
    { ending: "ios", description: "fem. nom. pl." },
    { ending: "es", description: "fem. nom. pl." },
    { ending: "us", description: "acc. pl. masc." },
    { ending: "as", description: "acc. pl. fem." },
    { ending: "ių", description: "gen. pl." },
    { ending: "ų", description: "gen. pl." },
    {
      ending: "omis",
      description: "inst. pl.",
    },
    {
      ending: "imis",
      description: "inst. pl.",
    },
    {
      ending: "iais",
      description: "inst. pl.",
    },
    { ending: "uose", description: "loc. pl." },
    { ending: "iuose", description: "loc. pl." },
    { ending: "ėse", description: "loc. pl." },
    { ending: "us", description: "masc. acc. sing." },
    { ending: "i", description: "fem. acc. sing." },
    { ending: "ius", description: "masc. nom. pl." },
    { ending: "ios", description: "fem. nom. pl." },
    { ending: "ų", description: "gen. pl." },
    { ending: "ių", description: "gen. pl." },
    {
      ending: "am",
      description: "dat. sing. masc.",
    },
    {
      ending: "iam",
      description: "dat. sing. fem.",
    },
    {
      ending: "ąją",
      description: "acc. sing. fem.",
    },
    {
      ending: "uoju",
      description: "inst. sing. masc.",
    },
    {
      ending: "ąja",
      description: "inst. sing. fem.",
    },
    {
      ending: "uosius",
      description: "acc. pl. masc.",
    },
    {
      ending: "osioms",
      description: "dat. pl. fem.",
    },
    { ending: "oje", description: "loc. sing." },
    { ending: "ėje", description: "loc. sing." },
    { ending: "yje", description: "loc. sing." },
    { ending: "uose", description: "loc. pl." },
    { ending: "iuose", description: "loc. pl." },
    {
      ending: "us",
      description: "masc. adj. nom. sing.",
    },
    {
      ending: "i",
      description: "fem. adj. nom. sing.",
    },
    {
      ending: "ius",
      description: "masc. adj. nom. pl.",
    },
    {
      ending: "ios",
      description: "fem. adj. nom. pl.",
    },
    {
      ending: "ų",
      description: "gen. adj. sing. masc.",
    },
    {
      ending: "ių",
      description: "gen. adj. pl.",
    },
    {
      ending: "am",
      description: "dat. adj. sing. masc.",
    },
    {
      ending: "iam",
      description: "dat. adj. sing. fem.",
    },
    {
      ending: "ąją",
      description: "acc. adj. sing. fem.",
    },
    {
      ending: "uoju",
      description: "inst. adj. sing. masc.",
    },
    {
      ending: "ąja",
      description: "inst. adj. sing. fem.",
    },
    {
      ending: "uosius",
      description: "acc. adj. pl. masc.",
    },
    {
      ending: "osioms",
      description: "dat. adj. pl. fem.",
    },
  ];

  const explainGrammaticalForms = (
    form: string,
    baseTranslation: string
  ): { description: string } => {
    const isVerb = baseTranslation.toLowerCase().startsWith("to ");
    const endingsMap = (isVerb ? verbEndingsMap : nounEndingsMap)
      .slice()
      .sort((a, b) => b.ending.length - a.ending.length);

    const endingEntry = endingsMap.find(({ ending }) => form.endsWith(ending));
    const description = endingEntry ? endingEntry.description : "";

    return { description };
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
                            {`${form} - ${
                              explainGrammaticalForms(
                                form,
                                word.englishTranslation
                              ).description
                            }`}
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
