import React from "react";
import { ScrollView, Text, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import CustomButton from "@components/CustomButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useAppDispatch } from "@src/redux/hooks";
import { resetClickedWords } from "@src/redux/slices/clickedWordsSlice";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

export default function Tab() {
  const dispatch = useAppDispatch();
  const handleStartLearning = () => {
    dispatch(resetClickedWords());
    router.push("/learning/sentences");
  };
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
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
      <CustomButton
        title={"Unlock Unlimited Challenges"}
        onPress={() =>
          router.push("/in-app-purchase/unlimited-sentences-screen")
        }
        icon={
          <FontAwesome5
            name="unlock-alt"
            size={20}
            color={globalColors.buttonText}
          />
        }
        style={{
          backgroundColor: globalColors.secondary,
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  image: {
    width: "100%",
    height: 300, // Adjust the height as needed
    alignSelf: "center",
    marginBottom: 20,
    borderRadius: 20,
  },
});
