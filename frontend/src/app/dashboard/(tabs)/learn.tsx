import React from "react";
import { ScrollView, Text, Alert, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import CustomButton from "@components/ui/CustomButton";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { resetClickedWords } from "@redux/slices/clickedWordsSlice";
import { FontAwesome5 } from "@expo/vector-icons";
import { setLoading } from "@redux/slices/uiSlice";
import { resetAllQuizKeys } from "@utils/storageUtils";
import crashlytics from "@react-native-firebase/crashlytics";
import { selectUserData } from "@redux/slices/userSlice";

export default function Tab() {
  const dispatch = useAppDispatch();
  const userData = useAppSelector(selectUserData);

  const handleStartLearning = () => {
    dispatch(resetClickedWords());
    router.push("/learning/sentences");
  };

  const handleRegenerateContent = async () => {
    try {
      if (userData) {
        dispatch(setLoading(true));
        await resetAllQuizKeys(userData.id);
        Alert.alert(
          "Success",
          "Content has been successfully reset. You can start a new challenge now."
        );
      }
    } catch (error) {
      console.error("Error resetting content:", error);
      crashlytics().recordError(error as Error);
    } finally {
      dispatch(setLoading(false));
    }
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
        title={"Start a New Challenge"}
        onPress={handleRegenerateContent}
        icon={
          <FontAwesome5
            name="crown"
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
    height: 300,
    alignSelf: "center",
    marginBottom: 20,
    borderRadius: 20,
  },
});
