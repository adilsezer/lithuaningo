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
            style={styles.button}
          />
          <CustomButton
            onPress={() => handlePress("signup")}
            title={"Create Account"}
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 250,
  },
  buttonContainer: {
    alignItems: "center",
    flex: 0.5,
    justifyContent: "center",
  },
  container: {
    alignItems: "center",
    flex: 1,
  },
  image: {
    flex: 1,
    height: null,
    resizeMode: "cover",
    width: null,
    borderRadius: 10,
  },
  imageContainer: {
    flex: 1,
    width: "100%",
  },
  textAndButtonContainer: {
    flex: 1,
  },
  textContainer: {
    flex: 0.5,
  },
});

export default WelcomeScreen;
