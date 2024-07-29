import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import CustomButton from "@components/CustomButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useAppDispatch } from "@src/redux/hooks";
import { resetClickedWords } from "@src/redux/slices/clickedWordsSlice";

export default function Tab() {
  const dispatch = useAppDispatch();
  const handleStartLearning = () => {
    dispatch(resetClickedWords());
    router.push("/learning/sentences");
  };
  const { styles: globalStyles } = useThemeStyles();

  return (
    <View style={styles.container}>
      <Image
        source={require("assets/images/learn_screen.png")}
        style={styles.image}
      />
      <Text style={globalStyles.title}>Start Reviewing Today's Words</Text>
      <Text style={globalStyles.subtitle}>
        In this session, you'll learn Lithuanian with today's sentences,
        flashcards, and quizzes. Keep up the awesome work!
      </Text>
      <CustomButton title="Start" onPress={handleStartLearning} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  image: {
    width: "100%",
    height: "50%",
    alignSelf: "center",
    marginBottom: 20,
    borderRadius: 20,
  },
});
