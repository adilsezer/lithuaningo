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
import { SectionText, Subtitle } from "@components/typography";
import { Ionicons } from "@expo/vector-icons";
import { DashboardWord } from "@src/types";
import { useThemeStyles } from "@hooks/useThemeStyles";

type WordContentProps = DashboardWord & { isDarkMode: boolean };

const WordContent = ({
  lemma,
  partOfSpeech,
  ipa,
  englishTranslation,
  sentenceUsage,
  isDarkMode,
}: WordContentProps) => {
  const { colors } = useThemeStyles();
  const textStyle = { color: colors.cardText };

  return (
    <View style={styles.content}>
      <View style={styles.centered}>
        <SectionText style={[styles.title, textStyle]} contrast={isDarkMode}>
          {lemma}
        </SectionText>
        <SectionText
          style={[styles.subtitle, { color: colors.cardSubtitle }]}
          contrast={isDarkMode}
        >
          ({partOfSpeech}) • {ipa}
        </SectionText>
      </View>

      <View style={styles.textBlock}>
        <SectionText
          style={[styles.label, { color: colors.cardSubtitle }]}
          contrast={isDarkMode}
        >
          Meaning:
        </SectionText>
        <SectionText style={textStyle} contrast={isDarkMode}>
          {englishTranslation}
        </SectionText>
      </View>

      <View style={styles.textBlock}>
        <SectionText
          style={[styles.label, { color: colors.cardSubtitle }]}
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

export const ExpandYourVocabularyCard = ({
  words,
  loading,
  isDarkMode,
}: {
  words: DashboardWord[];
  loading: boolean;
  isDarkMode: boolean;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const fadeAnim = useState(new Animated.Value(1))[0];
  const slideAnim = useState(new Animated.Value(0))[0];
  const { colors } = useThemeStyles();

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
      <Subtitle>Expand Your Vocabulary</Subtitle>
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
            {activeIndex + 1} of {words.length} words
          </SectionText>
        )}
      </View>

      <View style={styles.cardWrapper}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.secondary,
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  cardWrapper: {
    position: "relative",
    alignItems: "center",
  },
  card: {
    borderRadius: 12,
    width: "100%",
    padding: 16,
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  content: {
    gap: 16,
  },
  centered: {
    alignItems: "center",
  },
  textBlock: {
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  example: {
    fontStyle: "italic",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  navButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -20 }],
    zIndex: 1,
  },
  navButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  leftButton: {
    left: 16,
  },
  rightButton: {
    right: 16,
  },
  counter: {
    marginLeft: 8,
    fontSize: 12,
  },
});
