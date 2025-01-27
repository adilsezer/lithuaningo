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
import { useUserData } from "@stores/useUserStore";
import CustomButton from "@components/ui/CustomButton";
import { useRouter } from "expo-router";
import { retrieveData } from "@utils/storageUtils";
import { getCurrentDateKey } from "@utils/dateUtils";
import { SENTENCE_KEYS } from "@config/constants";
import { useWordData } from "@hooks/useWordData";
import { useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";

interface FlashcardProps {
  wordId: string;
}

const Flashcard: React.FC<FlashcardProps> = ({ wordId }) => {
  const { word, lemma } = useWordData(wordId);
  const theme = useTheme();
  const router = useRouter();
  const userData = useUserData();
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

  const handleMarkButtonClick = () => {
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
              { backgroundColor: theme.colors.surface },
            ]}
          >
            {lemma?.imageUrl && (
              <Image
                source={{ uri: lemma.imageUrl }}
                style={[styles.image, isSmallScreen && styles.smallImage]}
              />
            )}
            <CustomText>{wordId}</CustomText>
            <View
              style={[
                styles.horizontalRule,
                { borderBottomColor: theme.colors.surface },
              ]}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.card,
              backAnimatedStyle,
              styles.cardBack,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            {lemma?.imageUrl && (
              <Image
                source={{ uri: lemma.imageUrl }}
                style={[styles.image, isSmallScreen && styles.smallImage]}
              />
            )}
            <CustomText>{word?.word}</CustomText>
            <View
              style={[
                styles.horizontalRule,
                { borderBottomColor: theme.colors.surface },
              ]}
            />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
      <CustomText>Tap the card to flip and see the translation</CustomText>
      <View style={styles.buttonContainer}>
        {!sentenceReviewCompleted ? (
          <View>
            <CustomButton
              title="Review Later"
              onPress={() => handleMarkButtonClick()}
            />
            <CustomButton
              title="Mark as Known"
              onPress={() => handleMarkButtonClick()}
            />
          </View>
        ) : (
          <CustomButton title="Go Back" onPress={() => router.back()} />
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
