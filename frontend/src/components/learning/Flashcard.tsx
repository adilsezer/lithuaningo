import React, { useEffect, useState } from "react";
import {
  View,
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
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
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
import { SectionTitle, Instruction } from "@components/typography";
import { useWordData } from "@hooks/useWordData";

interface FlashcardProps {
  wordId: string;
}

const Flashcard: React.FC<FlashcardProps> = ({ wordId }) => {
  const { word, lemma } = useWordData(wordId);
  const { colors } = useThemeStyles();
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
              { backgroundColor: colors.card },
            ]}
          >
            {lemma?.imageUrl && (
              <Image
                source={{ uri: lemma.imageUrl }}
                style={[styles.image, isSmallScreen && styles.smallImage]}
              />
            )}
            <SectionTitle>{wordId}</SectionTitle>
            <View
              style={[
                styles.horizontalRule,
                { borderBottomColor: colors.border },
              ]}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.card,
              backAnimatedStyle,
              styles.cardBack,
              { backgroundColor: colors.card },
            ]}
          >
            {lemma?.imageUrl && (
              <Image
                source={{ uri: lemma.imageUrl }}
                style={[styles.image, isSmallScreen && styles.smallImage]}
              />
            )}
            <SectionTitle>{word?.word}</SectionTitle>
            <View
              style={[
                styles.horizontalRule,
                { borderBottomColor: colors.border },
              ]}
            />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
      <Instruction>Tap the card to flip and see the translation</Instruction>
      <View style={styles.buttonContainer}>
        {!sentenceReviewCompleted ? (
          <View>
            <CustomButton
              title="Review Later"
              style={[styles.button, { backgroundColor: colors.secondary }]}
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
            style={[styles.button, { backgroundColor: colors.secondary }]}
            onPress={() => router.back()}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
