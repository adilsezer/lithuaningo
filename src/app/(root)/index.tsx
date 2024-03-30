import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import CustomButton from "@components/CustomButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

const WelcomeScreen = () => {
  const handlePress = (tab: "login" | "signup") => {
    router.push(`/auth/${tab}`);
  };
  const { styles: globalStyles } = useThemeStyles();

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require("assets/images/welcome-image.png")}
          style={styles.image}
        />
      </View>
      <View style={styles.textAndButtonContainer}>
        <View style={styles.textContainer}>
          <Text style={globalStyles.title}>Welcome to Lithuaningo</Text>
          <Text style={globalStyles.subtitle}>
            Your gateway to mastering Lithuanian! Dive into learning with ease
            and fun.
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton
            onPress={() => handlePress("login")}
            title={"Log In"}
            style={{ width: 250 }}
          />
          <CustomButton
            onPress={() => handlePress("signup")}
            title={"Create Account"}
            style={{ width: 250 }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  imageContainer: {
    flex: 1, // Keeps taking up half of the screen
    width: "100%", // Full width
  },
  image: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: "cover",
  },
  textAndButtonContainer: {
    flex: 1, // The remaining half of the screen
  },
  textContainer: {
    flex: 0.5, // Now takes up 25% of the overall screen space
  },
  buttonContainer: {
    flex: 0.5, // Another 25% of the overall screen for buttons
    justifyContent: "center",
    alignItems: "center",
  },
});

export default WelcomeScreen;
