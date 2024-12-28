import React, { useEffect } from "react";
import FlashcardScreen from "@components/learning/Flashcard";
import { useLocalSearchParams } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useAppDispatch } from "@redux/hooks";
import { setLoading } from "@redux/slices/uiSlice";
import { SectionText } from "@components/typography";
import { useThemeStyles } from "@hooks/useThemeStyles";

const Flashcard = () => {
  const { wordId } = useLocalSearchParams<{ wordId: string }>();
  const { colors } = useThemeStyles();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (wordId) {
      dispatch(setLoading(true));
    }
  }, [wordId, dispatch]);

  if (!wordId) {
    dispatch(setLoading(false));
    return (
      <View style={styles.errorContainer}>
        <SectionText style={{ color: colors.error }}>
          Error: wordId is missing
        </SectionText>
      </View>
    );
  }

  return <FlashcardScreen wordId={wordId} />;
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Flashcard;
