import React from "react";
import { ScrollView, View, Image, StyleSheet } from "react-native";
import CustomButton from "@components/ui/CustomButton";
import { SectionText, SectionTitle } from "@components/typography";
import ThemeSwitch from "@components/ui/ThemeSwitch";
import { useWelcome } from "@hooks/useWelcome";

const WelcomeScreen = () => {
  const { isDarkMode, toggleTheme, navigateToAuth } = useWelcome();

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <ThemeSwitch onToggle={toggleTheme} isDarkMode={isDarkMode} />
        <WelcomeImage />
        <WelcomeText />
        <AuthButtons onNavigate={navigateToAuth} />
      </View>
    </ScrollView>
  );
};

const WelcomeImage = () => (
  <View style={styles.imageContainer}>
    <Image
      source={require("assets/images/welcome-image.png")}
      style={styles.image}
      accessibilityLabel="Welcome to Lithuaningo"
    />
  </View>
);

const WelcomeText = () => (
  <View style={styles.textContainer}>
    <SectionTitle>Welcome to Lithuaningo</SectionTitle>
    <SectionText>
      Learn Lithuanian with daily sentences, flashcards, and reinforcing
      quizzes.
    </SectionText>
    <SectionText style={styles.sectionSpacing}>
      Join now and compete on our leaderboard!
    </SectionText>
  </View>
);

const AuthButtons = ({
  onNavigate,
}: {
  onNavigate: (route: "login" | "signup") => void;
}) => (
  <View style={styles.buttonContainer}>
    <CustomButton
      onPress={() => onNavigate("login")}
      title="Log In"
      accessibilityLabel="Log in to your account"
      accessibilityHint="Navigate to the login screen"
    />
    <CustomButton
      onPress={() => onNavigate("signup")}
      title="Create Account"
      accessibilityLabel="Create a new account"
      accessibilityHint="Navigate to the sign up screen"
    />
  </View>
);

export default WelcomeScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  buttonContainer: {
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 10,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
  },
  sectionSpacing: {
    marginTop: 10,
  },
});
