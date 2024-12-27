import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import apiClient from "@services/api/apiClient";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { setLoading } from "@redux/slices/uiSlice";
import CustomButton from "@components/ui/CustomButton";
import { useRouter } from "expo-router";
import {
  addClickedWord,
  removeClickedWord,
} from "@redux/slices/clickedWordsSlice";
import { retrieveData } from "@utils/storageUtils";
import { getCurrentDateKey } from "@utils/dateUtils";
import { selectUserData } from "@redux/slices/userSlice";
import { SENTENCE_KEYS } from "@config/constants";
import { WordForm, Lemma } from "@src/types";

interface Flashcard {
  wordId: string;
}

const Flashcard: React.FC<Flashcard> = ({ wordId }) => {
  const [word, setWord] = useState<WordForm | null>(null);
  const [lemma, setLemma] = useState<Lemma | null>(null);
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const userData = useAppSelector(selectUserData);
  const [sentenceReviewCompleted, setSentenceReviewCompleted] = useState<
    boolean | null
  >(null);

  const flip = useSharedValue(0);

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` }],
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` },
    ],
  }));

  const handleFlip = () => {
    flip.value = withTiming(flip.value === 0 ? 1 : 0, {
      duration: 500,
      easing: Easing.inOut(Easing.ease),
    });
  };

  useEffect(() => {
    const loadWord = async () => {
      try {
        dispatch(setLoading(true));
        const wordForm = await apiClient.getWordForm(wordId);
        setWord(wordForm);
        const lemma = await apiClient.getLemma(wordForm.lemmaId);
        setLemma(lemma);
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

  useEffect(() => {
    const fetchCompletionStatus = async () => {
      try {
        if (userData?.id) {
          const status = await retrieveData<boolean>(
            SENTENCE_KEYS.COMPLETION_STATUS_KEY(
              userData.id,
              getCurrentDateKey()
            )
          );
          setSentenceReviewCompleted(status);
        }
      } catch (error) {
        console.error("Error retrieving completion status:", error);
      }
    };

    fetchCompletionStatus();
  }, [userData]);

  const handleMarkButtonClick = (addWord: boolean) => {
    if (addWord) {
      dispatch(addClickedWord(wordId));
    } else {
      dispatch(removeClickedWord(wordId));
    }
    router.back();
  };

  const windowWidth = Dimensions.get("window").width;
  const isSmallScreen = windowWidth < 375;

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <TouchableWithoutFeedback onPress={handleFlip}>
        <View style={styles.cardContainer}>
          <Animated.View
            style={[
              styles.card,
              frontAnimatedStyle,
              { backgroundColor: globalColors.card },
            ]}
          >
            {lemma?.imageUrl && (
              <Image
                source={{ uri: lemma.imageUrl }}
                style={[styles.image, isSmallScreen && styles.smallImage]}
              />
            )}
            <Text style={[globalStyles.contrastTitle]}>{wordId}</Text>
            <View
              style={[
                styles.horizontalRule,
                { borderBottomColor: globalColors.border },
              ]}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.card,
              backAnimatedStyle,
              styles.cardBack,
              { backgroundColor: globalColors.card },
            ]}
          >
            {lemma?.imageUrl && (
              <Image
                source={{ uri: lemma.imageUrl }}
                style={[styles.image, isSmallScreen && styles.smallImage]}
              />
            )}
            <Text style={[globalStyles.contrastTitle]}>{word?.word}</Text>
            <View
              style={[
                styles.horizontalRule,
                { borderBottomColor: globalColors.border },
              ]}
            />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
      <Text style={[globalStyles.instruction]}>
        Tap the card to flip and see the translation
      </Text>
      <View style={styles.buttonContainer}>
        {!sentenceReviewCompleted ? (
          <View>
            <CustomButton
              title="Review Later"
              style={[
                styles.button,
                { backgroundColor: globalColors.secondary },
              ]}
              onPress={() => handleMarkButtonClick(false)}
            />
            <CustomButton
              title="Mark as Known"
              onPress={() => handleMarkButtonClick(true)}
            />
          </View>
        ) : (
          <CustomButton
            title="Go Back"
            style={[styles.button, { backgroundColor: globalColors.secondary }]}
            onPress={() => router.back()}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 10,
    alignItems: "center",
  },
  cardContainer: {
    width: "100%",
    alignItems: "center",
  },
  card: {
    justifyContent: "center",
    alignItems: "center",
    backfaceVisibility: "hidden",
    width: "100%",
    borderRadius: 20,
    borderWidth: 0.5,
    padding: 20,
    marginBottom: 20,
    minHeight: 300,
  },
  cardBack: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
  },
  imageContainer: {
    width: "100%",
    height: "80%",
    paddingHorizontal: 15,
    marginVertical: 5,
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
    marginBottom: 10,
    alignSelf: "center",
    borderRadius: 10,
  },
  smallImage: {
    width: 250,
    height: 250,
  },
  input: {
    marginVertical: 10,
  },
  button: {
    marginVertical: 10,
  },
  buttonContainer: {
    width: "100%",
    marginVertical: 20,
  },
  horizontalRule: {
    width: "80%",
    alignSelf: "center",
    borderBottomWidth: 1,
    marginVertical: 10,
  },
});

export default Flashcard;
