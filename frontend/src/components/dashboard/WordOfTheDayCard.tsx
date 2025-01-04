import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  Animated,
  Easing,
} from "react-native";
import { SectionText } from "@components/typography";
import { Ionicons } from "@expo/vector-icons";
import { WordOfTheDay } from "@src/types";
import { useThemeStyles } from "@hooks/useThemeStyles";

type WordContentProps = WordOfTheDay & { isDarkMode: boolean };

const WordContent = ({
  lemma,
  partOfSpeech,
  ipa,
  englishTranslation,
  sentenceUsage,
  isDarkMode,
}: WordContentProps) => {
  const { colors } = useThemeStyles();
  const textStyle = { color: colors.text };
  const subtitleStyle = { color: colors.lightText };

  return (
    <View style={styles.content}>
      <View style={styles.centered}>
        <SectionText style={[styles.title, textStyle]} contrast={isDarkMode}>
          {lemma}
        </SectionText>
        <SectionText
          style={[styles.subtitle, subtitleStyle]}
          contrast={isDarkMode}
        >
          ({partOfSpeech})
        </SectionText>
        <SectionText
          style={[styles.subtitle, subtitleStyle]}
          contrast={isDarkMode}
        >
          {ipa}
        </SectionText>
      </View>

      <View style={styles.centered}>
        <SectionText
          style={[styles.subtitle, subtitleStyle]}
          contrast={isDarkMode}
        >
          Meaning:
        </SectionText>
        <SectionText style={textStyle} contrast={isDarkMode}>
          {englishTranslation}
        </SectionText>
      </View>

      <View style={styles.centered}>
        <SectionText
          style={[styles.subtitle, subtitleStyle]}
          contrast={isDarkMode}
        >
          Example:
        </SectionText>
        <SectionText style={[styles.example, textStyle]} contrast={isDarkMode}>
          {sentenceUsage}
        </SectionText>
      </View>
    </View>
  );
};

export const WordOfTheDayCard = ({
  words,
  loading,
  isDarkMode,
}: {
  words: WordOfTheDay[];
  loading: boolean;
  isDarkMode: boolean;
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const fadeAnim = useState(new Animated.Value(1))[0];
  const slideAnim = useState(new Animated.Value(0))[0];
  const { colors } = useThemeStyles();

  const cardWidth = windowWidth - 48;

  const navigateToCard = (direction: "next" | "prev") => {
    const isNext = direction === "next";
    const moveDistance = 30; // Reduced slide distance for subtler animation

    // Start from the side we're moving from
    slideAnim.setValue(isNext ? moveDistance : -moveDistance);

    // Animate current card out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: isNext ? -moveDistance / 2 : moveDistance / 2,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start(() => {
      // Update index
      setActiveIndex((prev) => (isNext ? prev + 1 : prev - 1));

      // Reset position for next card
      slideAnim.setValue(isNext ? -moveDistance : moveDistance);

      // Animate new card in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250, // Slightly longer fade in for better visibility
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]).start();
    });
  };

  return (
    <View style={styles.container}>
      <SectionText
        style={[styles.headerTitle, { color: colors.text }]}
        contrast={isDarkMode}
      >
        Expand Your Vocabulary
      </SectionText>

      <View style={styles.cardWrapper}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.secondary,
              width: cardWidth,
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {loading ? (
            <SectionText style={{ color: colors.text }} contrast={isDarkMode}>
              Loading...
            </SectionText>
          ) : (
            <WordContent {...words[activeIndex]} isDarkMode={isDarkMode} />
          )}
        </Animated.View>

        {!loading && activeIndex > 0 && (
          <TouchableOpacity
            style={[styles.navButton, styles.leftButton]}
            activeOpacity={0.7}
            onPress={() => navigateToCard("prev")}
          >
            <View
              style={[
                styles.navButtonInner,
                { backgroundColor: colors.primary },
              ]}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        )}

        {!loading && activeIndex < words.length - 1 && (
          <TouchableOpacity
            style={[styles.navButton, styles.rightButton]}
            activeOpacity={0.7}
            onPress={() => navigateToCard("next")}
          >
            <View
              style={[
                styles.navButtonInner,
                { backgroundColor: colors.primary },
              ]}
            >
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {words.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    activeIndex === index ? colors.primary : colors.inactive,
                  width: activeIndex === index ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>
        {!loading && words.length > 0 && (
          <SectionText
            style={[styles.counter, { color: colors.lightText }]}
            contrast={isDarkMode}
          >
            {activeIndex + 1} of {words.length}
          </SectionText>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 28,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  counter: {
    fontSize: 14,
    marginLeft: 12,
  },
  cardWrapper: {
    position: "relative",
    alignItems: "center",
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    borderWidth: Platform.select({ ios: 0.2, android: 0.5 }),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  content: {
    gap: 12,
  },
  centered: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    marginVertical: 4,
  },
  example: {
    fontStyle: "italic",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  navButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -25 }],
    zIndex: 1,
    padding: 5,
  },
  navButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  leftButton: {
    left: -12,
  },
  rightButton: {
    right: -12,
  },
});
