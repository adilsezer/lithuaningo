import React from "react";
import { View, Text, StyleSheet, Image, Platform } from "react-native";
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
      <View style={styles.textContainer}>
        <Text style={globalStyles.title}>Welcome to Lithuaningo</Text>
        <Text style={globalStyles.subtitle}>
          Your gateway to mastering Lithuanian! Dive into learning with ease and
          fun.
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
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    justifyContent: "center",
    marginBottom: 20, // Adding margin to create some space at the bottom
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  image: {
    height: "100%",
    resizeMode: "cover",
    width: "100%",
    borderRadius: 10,
  },
  imageContainer: {
    width: "100%",
    height: "50%", // Adjust the height as needed
  },
  textContainer: {
    width: "100%",
    paddingHorizontal: 20, // Add padding for better spacing
    alignItems: "center",
  },
});

export default WelcomeScreen;
