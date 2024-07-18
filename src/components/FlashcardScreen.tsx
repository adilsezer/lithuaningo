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
      } catch (error) {
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
        <Text style={globalStyles.text}>
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
      { ending: "u", translation: "(I)" },
      { ending: "i", translation: "(you sing.)" },
      { ending: "a", translation: "(he/she/it)" },
      { ending: "ame", translation: "(we)" },
      { ending: "ate", translation: "(you pl.)" },
      { ending: "a", translation: "(they)" },
      // Past Tense
      { ending: "au", translation: "(I)" },
      { ending: "ai", translation: "(you sing.)" },
      { ending: "o", translation: "(he/she/it)" },
      { ending: "ome", translation: "(we)" },
      { ending: "ote", translation: "(you pl.)" },
      { ending: "o", translation: "(they)" },
      // Future Tense
      { ending: "siu", translation: "(I will)" },
      { ending: "si", translation: "(you sing. will)" },
      { ending: "s", translation: "(he/she/it will)" },
      { ending: "sime", translation: "(we will)" },
      { ending: "site", translation: "(you pl. will)" },
      { ending: "s", translation: "(they will)" },
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
    ];

    const nounEndingsMap = [
      // Singular Noun Endings
      { ending: "as", translation: "(masc. sing.)" },
      { ending: "is", translation: "(masc. sing.)" },
      { ending: "a", translation: "(fem. sing.)" },
      { ending: "ė", translation: "(fem. sing.)" },
      { ending: "ą", translation: "(acc. sing.)" },
      { ending: "ę", translation: "(acc. sing.)" },
      { ending: "o", translation: "(gen. sing.)" },
      { ending: "ės", translation: "(gen. sing.)" },
      { ending: "ui", translation: "(dat. sing.)" },
      { ending: "iai", translation: "(dat. sing.)" },
      { ending: "į", translation: "(dat. sing.)" },
      { ending: "uje", translation: "(loc. sing.)" },
      { ending: "ėje", translation: "(loc. sing.)" },
      { ending: "umi", translation: "(inst. sing.)" },
      { ending: "imi", translation: "(inst. sing.)" },
      // Plural Noun Endings
      { ending: "ai", translation: "(masc. pl.)" },
      { ending: "ys", translation: "(masc. pl.)" },
      { ending: "os", translation: "(fem. pl./gen. pl.)" },
      { ending: "ios", translation: "(fem. pl.)" },
      { ending: "es", translation: "(fem. pl.)" },
      { ending: "us", translation: "(acc. pl. masc.)" },
      { ending: "as", translation: "(acc. pl. fem.)" },
      { ending: "ių", translation: "(gen. pl.)" },
      { ending: "ų", translation: "(gen. pl.)" },
      { ending: "omis", translation: "(inst. pl.)" },
      { ending: "imis", translation: "(inst. pl.)" },
      { ending: "iais", translation: "(inst. pl.)" },
      { ending: "uose", translation: "(loc. pl.)" },
      { ending: "iuose", translation: "(loc. pl.)" },
      { ending: "ėse", translation: "(loc. pl.)" },
      // Adjective Endings
      { ending: "us", translation: "(masc. adj. sing.)" },
      { ending: "i", translation: "(fem. adj. sing.)" },
      { ending: "ius", translation: "(masc. adj. pl.)" },
      { ending: "ios", translation: "(fem. adj. pl.)" },
      { ending: "ų", translation: "(gen. adj. sing. masc.)" },
      { ending: "ių", translation: "(gen. adj. pl.)" },
      { ending: "am", translation: "(dat. adj. sing. masc.)" },
      { ending: "iam", translation: "(dat. adj. sing. fem.)" },
      { ending: "ąją", translation: "(acc. adj. sing. fem.)" },
      { ending: "uoju", translation: "(inst. adj. sing. masc.)" },
      { ending: "ąja", translation: "(inst. adj. sing. fem.)" },
      { ending: "uosius", translation: "(acc. adj. pl. masc.)" },
      { ending: "osioms", translation: "(dat. adj. pl. fem.)" },
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
            <Text style={[globalStyles.title, { marginLeft: 8 }]}>
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
                  <Text style={[globalStyles.subtitle]}>Variants:</Text>
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
                          <Text style={[globalStyles.subtitle]}>•</Text>
                          <Text
                            style={[
                              globalStyles.subtitle,
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
            <Text style={[globalStyles.title]}>{word.englishTranslation}</Text>
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
