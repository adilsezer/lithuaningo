import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
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
import { router } from "expo-router";
import CustomTextInput from "./CustomTextInput";
import {
  addClickedWord,
  removeClickedWord,
} from "@src/redux/slices/clickedWordsSlice";
import { cleanWord } from "@utils/stringUtils";

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
        alert(
          "Thanks for helping improve our app! Your word has been submitted for review."
        );
        setNewWord("");
        setTranslation("");
        setGrammaticalForms("");
      } catch (error) {
        console.error("Error adding word for review:", error);
        alert("Failed to submit word for review. Please try again.");
      } finally {
        dispatch(setLoading(false));
      }
    } else {
      alert("Please fill in all fields.");
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
        console.error("Error loading word:", error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadWord();
  }, [wordId, dispatch]);

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

  const handleMarkAsKnown = (word: string) => {
    const cleanedWord = cleanWord(word);
    dispatch(addClickedWord(cleanedWord));
    router.back();
  };

  const handleReviewLater = (word: string) => {
    const cleanedWord = cleanWord(word);
    dispatch(removeClickedWord(cleanedWord));
    router.back();
  };

  return (
    <View>
      <Text style={[globalStyles.subtitle]}>
        Tap the card to flip and see the translation
      </Text>
      <TouchableWithoutFeedback onPress={handleFlip}>
        <View style={styles.cardContainer}>
          <Animated.View
            style={[
              styles.card,
              frontAnimatedStyle,
              { backgroundColor: globalColors.card },
            ]}
          >
            {word.imageUrl && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: word.imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
            )}
            <Text style={[globalStyles.title]}>{word.id}</Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.card,
              backAnimatedStyle,
              styles.cardBack,
              { backgroundColor: globalColors.card },
            ]}
          >
            {word.imageUrl && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: word.imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
            )}
            <Text style={[globalStyles.title]}>{word.englishTranslation}</Text>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>

      <CustomButton
        title="Mark as Known"
        onPress={() => handleMarkAsKnown(wordId)}
        style={styles.button}
      />
      <CustomButton
        title="Review Later"
        style={{ backgroundColor: globalColors.secondary }}
        onPress={() => handleReviewLater(wordId)}
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
});

export default FlashcardScreen;
