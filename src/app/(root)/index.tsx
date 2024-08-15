import React from "react";
import { ScrollView, View, Text, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import CustomButton from "@components/CustomButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

const WelcomeScreen = () => {
  const handlePress = (tab: "login" | "signup") => {
    router.push(`/auth/${tab}`);
  };
  const { styles: globalStyles } = useThemeStyles();

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={require("assets/images/welcome-image.png")}
            style={styles.image}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={globalStyles.title}>Welcome to Lithuaningo</Text>
          <Text style={globalStyles.subtitle}>
            Learn Lithuanian with daily sentences, flashcards for words, and
            reinforcing quizzes.
          </Text>
          <Text style={globalStyles.subtitle}>
            Join now and compete on our leaderboard!
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton onPress={() => handlePress("login")} title={"Log In"} />
          <CustomButton
            onPress={() => handlePress("signup")}
            title={"Create Account"}
          />
        </View>
      </View>
    </ScrollView>
  );
};

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
    resizeMode: "cover", // Ensure the image covers the container
    borderRadius: 10,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1, // Maintain a square aspect ratio
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
  },
});

export default WelcomeScreen;
