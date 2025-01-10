import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Image,
} from "react-native";
import { Flashcard } from "@src/types";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { FontAwesome5 } from "@expo/vector-icons";
import CustomButton from "@components/ui/CustomButton";
import { Audio } from "expo-av";

interface FlashcardViewProps {
  flashcard: Flashcard;
  onAnswer: (isCorrect: boolean) => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  flashcard,
  onAnswer,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [sound, setSound] = useState<Audio.Sound>();
  const { colors } = useThemeStyles();
  const flipAnim = useRef(new Animated.Value(0)).current;

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  async function playSound() {
    if (!flashcard.audioUrl) return;

    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync({
        uri: flashcard.audioUrl,
      });
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const renderCardContent = (isBack: boolean) => (
    <View style={styles.content} pointerEvents="box-none">
      {!isBack && flashcard.imageUrl && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: flashcard.imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      )}
      <Text style={[styles.mainText, { color: colors.text }]}>
        {isBack ? flashcard.back : flashcard.front}
      </Text>
      {flashcard.exampleSentence && !isBack && (
        <Text style={[styles.exampleText, { color: colors.cardText }]}>
          Example: {flashcard.exampleSentence}
        </Text>
      )}
      {!isBack && flashcard.audioUrl && (
        <View pointerEvents="box-none" style={styles.audioWrapper}>
          <TouchableOpacity
            onPress={playSound}
            style={[styles.audioButton, { backgroundColor: colors.primary }]}
          >
            <FontAwesome5
              name="volume-up"
              size={20}
              color={colors.buttonText}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderAnswerButtons = () => (
    <View style={styles.answerButtons}>
      <CustomButton
        title="Incorrect"
        onPress={() => {
          onAnswer(false);
          setIsFlipped(false);
          flipAnim.setValue(0);
        }}
        style={[styles.button, { backgroundColor: colors.error }]}
      />
      <CustomButton
        title="Correct"
        onPress={() => {
          onAnswer(true);
          setIsFlipped(false);
          flipAnim.setValue(0);
        }}
        style={[styles.button, { backgroundColor: colors.success }]}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          onPress={handleFlip}
          activeOpacity={0.8}
          style={styles.cardContainer}
        >
          <Animated.View
            style={[
              styles.card,
              { backgroundColor: colors.card },
              styles.cardFace,
              frontAnimatedStyle,
            ]}
            pointerEvents="box-none"
          >
            {renderCardContent(false)}
            <FontAwesome5
              name="undo"
              size={16}
              color={colors.cardText}
              style={styles.flipIcon}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.card,
              { backgroundColor: colors.card },
              styles.cardFace,
              styles.cardBack,
              backAnimatedStyle,
            ]}
            pointerEvents="box-none"
          >
            {renderCardContent(true)}
            <FontAwesome5
              name="undo"
              size={16}
              color={colors.cardText}
              style={styles.flipIcon}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
      {isFlipped && (
        <View style={styles.buttonsWrapper}>{renderAnswerButtons()}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardWrapper: {
    flex: 1,
    minHeight: 400,
  },
  cardContainer: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardFace: {
    backfaceVisibility: "hidden",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardBack: {
    transform: [{ rotateY: "180deg" }],
  },
  content: {
    alignItems: "center",
    width: "100%",
  },
  mainText: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  exampleText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 16,
  },
  flipIcon: {
    position: "absolute",
    bottom: 20,
    right: 20,
    opacity: 0.5,
  },
  buttonsWrapper: {
    marginTop: 24,
  },
  answerButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    minWidth: 150,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  audioWrapper: {
    position: "relative",
    zIndex: 2,
  },
  audioButton: {
    padding: 12,
    borderRadius: 30,
    marginTop: 16,
  },
});
