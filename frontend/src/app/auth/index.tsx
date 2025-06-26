import React from "react";
import { ScrollView, View, Image, StyleSheet } from "react-native";
import CustomButton from "@components/ui/CustomButton";
import CustomSwitch from "@components/ui/CustomSwitch";
import CustomText from "@components/ui/CustomText";
import { useWelcome } from "@hooks/useWelcome";

const WelcomeScreen = () => {
  const { isDarkMode, toggleTheme, navigateToAuth } = useWelcome();

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <CustomSwitch
          onValueChange={toggleTheme}
          value={isDarkMode}
          label="Dark Mode"
        />
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
      source={require("../../../assets/images/welcome-image.png")}
      style={styles.image}
      accessibilityLabel="Welcome to Lithuaningo"
    />
  </View>
);

const WelcomeText = () => (
  <View style={styles.textContainer}>
    <CustomText variant="bodyLarge">
      Master Lithuanian with AI-powered flashcards, daily challenges, and
      personalized learning.
    </CustomText>
    <CustomText variant="bodyLarge">
      Track your progress and climb the leaderboard!
    </CustomText>
  </View>
);

const AuthButtons = ({
  onNavigate,
}: {
  onNavigate: (route: "login" | "signup") => void;
}) => (
  <View style={styles.buttonContainer}>
    <CustomButton onPress={() => onNavigate("login")} title="Log In" />
    <CustomButton onPress={() => onNavigate("signup")} title="Create Account" />
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
});
