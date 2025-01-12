import React from "react";
import { ScrollView, Image, StyleSheet } from "react-native";
import CustomButton from "@components/ui/CustomButton";
import { SectionText, SectionTitle } from "@components/typography";
import { useChallenge } from "@hooks/useChallenge";

const learningOptions = [
  {
    title: "Practice Flashcards",
    route: "/learning/flashcards",
  },
  {
    title: "Take Quiz",
    route: "/learning/quiz",
  },
] as const;

export default function LearnScreen() {
  const { handleNavigation } = useChallenge();

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Image
        source={require("assets/images/learn_screen.png")}
        style={styles.image}
      />
      <SectionTitle>Review Your Progress</SectionTitle>
      <SectionText style={styles.sectionSpacing}>
        Choose how you want to practice: use flashcards to review words or test
        your knowledge with a quiz to check your progress.
      </SectionText>

      {learningOptions.map((option, index) => (
        <CustomButton
          key={option.route}
          title={option.title}
          onPress={() => handleNavigation(option.route)}
          style={index > 0 && styles.buttonSpacing}
        />
      ))}
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
