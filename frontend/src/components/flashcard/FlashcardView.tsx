import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Image,
  TouchableWithoutFeedback,
  GestureResponderEvent,
} from "react-native";
import { Card, Text, IconButton, useTheme } from "react-native-paper";
import { Flashcard } from "@src/types";
import CustomButton from "@components/ui/CustomButton";
import { useFlashcards } from "@hooks/useFlashcards";

interface FlashcardViewProps {
  flashcard: Flashcard;
  onAnswer: (isCorrect: boolean) => void;
}

const AudioControl: React.FC<{ url: string }> = ({ url }) => {
  const { handlePlaySound, isPlaying } = useFlashcards();
  const theme = useTheme();

  const handlePress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    handlePlaySound(url);
  };

  return (
    <View style={styles.audioWrapper}>
      <IconButton
        icon={isPlaying(url) ? "pause" : "volume-high"}
        size={32}
        onPress={handlePress}
        mode="contained"
        containerColor={theme.colors.primary}
        iconColor={theme.colors.onPrimary}
        style={styles.audioButton}
      />
    </View>
  );
};

const CardContent: React.FC<{
  isBack: boolean;
  flashcard: Flashcard;
  onFlipPress: (event: GestureResponderEvent) => void;
}> = ({ isBack, flashcard, onFlipPress }) => {
  const theme = useTheme();

  return (
    <View style={styles.content}>
      {!isBack && flashcard.imageUrl && (
        <Image
          source={{ uri: flashcard.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <Text variant="headlineMedium" style={styles.mainText}>
        {isBack ? flashcard.back : flashcard.front}
      </Text>
      {flashcard.exampleSentence && !isBack && (
        <Text
          variant="bodyLarge"
          style={[styles.exampleText, { color: theme.colors.onSurfaceVariant }]}
        >
          Example: {flashcard.exampleSentence}
        </Text>
      )}
      {!isBack && flashcard.audioUrl && (
        <AudioControl url={flashcard.audioUrl} />
      )}
      <IconButton
        icon="rotate-3d"
        size={20}
        onPress={onFlipPress}
        style={styles.flipIcon}
        iconColor={theme.colors.onSurfaceVariant}
      />
    </View>
  );
};

const AnswerButtons: React.FC<{
  onAnswer: (isCorrect: boolean) => void;
  onAnswered: () => void;
}> = ({ onAnswer, onAnswered }) => (
  <View style={styles.answerButtons}>
    <CustomButton
      title="Incorrect"
      onPress={() => {
        onAnswer(false);
        onAnswered();
      }}
      mode="outlined"
    />
    <CustomButton
      title="Correct"
      onPress={() => {
        onAnswer(true);
        onAnswered();
      }}
      mode="contained"
    />
  </View>
);

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  flashcard,
  onAnswer,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const theme = useTheme();
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

  const handleFlipButtonPress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    handleFlip();
  };

  const resetCard = () => {
    setIsFlipped(false);
    flipAnim.setValue(0);
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

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={handleFlip}>
        <Card style={styles.cardWrapper}>
          <Card.Content style={styles.cardContainer}>
            <Animated.View
              style={[
                styles.cardFace,
                frontAnimatedStyle,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <CardContent
                isBack={false}
                flashcard={flashcard}
                onFlipPress={handleFlipButtonPress}
              />
            </Animated.View>
            <Animated.View
              style={[
                styles.cardFace,
                styles.cardBack,
                backAnimatedStyle,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <CardContent
                isBack={true}
                flashcard={flashcard}
                onFlipPress={handleFlipButtonPress}
              />
            </Animated.View>
          </Card.Content>
        </Card>
      </TouchableWithoutFeedback>
      {isFlipped && (
        <View style={styles.buttonsWrapper}>
          <AnswerButtons onAnswer={onAnswer} onAnswered={resetCard} />
        </View>
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
    elevation: 2,
  },
  cardContainer: {
    flex: 1,
    minHeight: 400,
  },
  cardFace: {
    flex: 1,
    backfaceVisibility: "hidden",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    padding: 16,
  },
  cardBack: {
    transform: [{ rotateY: "180deg" }],
  },
  content: {
    alignItems: "center",
    width: "100%",
    paddingVertical: 16,
  },
  mainText: {
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  exampleText: {
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 24,
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  flipIcon: {
    position: "absolute",
    bottom: 12,
    right: 12,
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
  image: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 10,
    marginBottom: 32,
  },
  audioWrapper: {
    padding: 8,
    marginTop: 16,
  },
  audioButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});
