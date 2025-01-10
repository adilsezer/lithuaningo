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

const AudioButton = ({ url }: { url: string }) => {
  const [sound, setSound] = useState<Audio.Sound>();
  const { colors } = useThemeStyles();

  React.useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  const playSound = async () => {
    try {
      if (sound) await sound.unloadAsync();
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: url });
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  return (
    <TouchableOpacity
      onPress={playSound}
      style={[styles.audioButton, { backgroundColor: colors.primary }]}
    >
      <FontAwesome5 name="volume-up" size={20} color={colors.buttonText} />
    </TouchableOpacity>
  );
};

const CardContent = ({
  text,
  example,
  imageUrl,
  audioUrl,
}: {
  text: string;
  example?: string;
  imageUrl?: string;
  audioUrl?: string;
}) => {
  const { colors } = useThemeStyles();

  return (
    <View style={styles.content}>
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      )}
      <Text style={[styles.mainText, { color: colors.text }]}>{text}</Text>
      {example && (
        <Text style={[styles.exampleText, { color: colors.cardText }]}>
          Example: {example}
        </Text>
      )}
      {audioUrl && <AudioButton url={audioUrl} />}
    </View>
  );
};

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  flashcard,
  onAnswer,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { colors } = useThemeStyles();
  const flipAnim = useRef(new Animated.Value(0)).current;

  const handleFlip = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        }),
      },
    ],
  };

  const backAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["180deg", "360deg"],
        }),
      },
    ],
  };

  const handleAnswer = (isCorrect: boolean) => {
    onAnswer(isCorrect);
    setIsFlipped(false);
    flipAnim.setValue(0);
  };

  return (
    <View style={styles.container}>
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
        >
          <CardContent
            text={flashcard.front}
            example={flashcard.exampleSentence}
            imageUrl={flashcard.imageUrl}
            audioUrl={flashcard.audioUrl}
          />
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
        >
          <CardContent text={flashcard.back} />
          <FontAwesome5
            name="undo"
            size={16}
            color={colors.cardText}
            style={styles.flipIcon}
          />
        </Animated.View>
      </TouchableOpacity>
      {isFlipped && (
        <View style={styles.buttonsWrapper}>
          <View style={styles.answerButtons}>
            <CustomButton
              title="Incorrect"
              onPress={() => handleAnswer(false)}
              style={[styles.button, { backgroundColor: colors.error }]}
            />
            <CustomButton
              title="Correct"
              onPress={() => handleAnswer(true)}
              style={[styles.button, { backgroundColor: colors.success }]}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 400,
  },
  cardContainer: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
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
    padding: 16,
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
  image: {
    width: "100%",
    height: 200,
    marginBottom: 16,
    borderRadius: 10,
  },
  audioButton: {
    padding: 12,
    borderRadius: 30,
    marginTop: 16,
  },
});
