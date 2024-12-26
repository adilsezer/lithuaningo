import React, { useEffect } from "react";
import FlashcardScreen from "@components/learning/Flashcard";
import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useAppDispatch } from "@redux/hooks";
import { setLoading } from "@redux/slices/uiSlice";

const Flashcard = () => {
  const { wordId } = useLocalSearchParams<{ wordId: string }>();
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
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
        <Text style={[globalStyles.text, { color: globalColors.error }]}>
          Error: wordId is missing
        </Text>
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
