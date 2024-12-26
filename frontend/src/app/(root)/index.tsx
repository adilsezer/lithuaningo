import React from "react";
import { ScrollView, View, Text, Image } from "react-native";
import { router } from "expo-router";
import CustomButton from "@components/ui/CustomButton";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { styles } from "@styles/screens/welcome/styles";

const WelcomeScreen = () => {
  const { styles: globalStyles } = useThemeStyles();

  const navigateToAuth = (route: "login" | "signup") => {
    router.push(`/auth/${route}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <WelcomeImage />
        <WelcomeText styles={globalStyles} />
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
    />
  </View>
);

const WelcomeText = ({ styles }: { styles: any }) => (
  <View style={styles.textContainer}>
    <Text style={styles.title}>Welcome to Lithuaningo</Text>
    <Text style={styles.subtitle}>
      Learn Lithuanian with daily sentences, flashcards for words, and
      reinforcing quizzes.
    </Text>
    <Text style={styles.subtitle}>
      Join now and compete on our leaderboard!
    </Text>
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
