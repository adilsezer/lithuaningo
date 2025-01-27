import React from "react";
import { ScrollView, Image, StyleSheet } from "react-native";
import CustomButton from "@components/ui/CustomButton";
import { router } from "expo-router";
import CustomText from "@components/typography/CustomText";
export default function LearnScreen() {
  const handleNavigation = (route: string) => {
    router.push(route);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Image
        source={require("assets/images/learn_screen.png")}
        style={styles.image}
      />
      <CustomText>Daily Challenge</CustomText>
      <CustomText style={styles.sectionSpacing}>
        Ready for today's Lithuaningo challenge? Test your skills with a daily
        quiz or warm up with flashcards.
      </CustomText>

      <CustomButton
        title="Start Daily Challenge"
        onPress={() => handleNavigation("/learning/quiz")}
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
  buttonSpacing: {
    marginTop: 10,
  },
  sectionSpacing: {
    marginBottom: 20,
  },
});
