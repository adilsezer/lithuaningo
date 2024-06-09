import React from "react";
import { Text, StyleSheet, ScrollView, Alert, View } from "react-native";
import * as Linking from "expo-linking";
import Constants from "expo-constants";
import BackButton from "@components/BackButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

export default function AboutScreen() {
  const handleLinkPress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "Error",
          "Unable to open the email client. Please check if an email app is installed and configured."
        );
        console.error("Unsupported URL: ", url);
      }
    } catch (err) {
      Alert.alert(
        "Error",
        "An error occurred while trying to open the URL. Please try again later."
      );
      console.error("Failed to open URL:", err);
    }
  };

  const { styles: globalStyles } = useThemeStyles();
  const appVersion = Constants.expoConfig?.version || "Unknown";

  return (
    <ScrollView>
      <BackButton />
      <View style={styles.container}>
        <Text style={globalStyles.title}>About Lithuaningo</Text>
        <Text style={[globalStyles.text, styles.customText]}>
          Lithuaningo is your gateway to mastering Lithuanian! Dive into
          learning with ease and fun. Our app provides a comprehensive learning
          experience with various features and tools to help you become
          proficient in Lithuanian.
        </Text>

        <Text style={globalStyles.title}>Contact Us</Text>
        <Text style={[globalStyles.text, styles.customText]}>
          Email:{" "}
          <Text
            style={styles.link}
            onPress={() => handleLinkPress("mailto:lithuaningo@gmail.com")}
          >
            lithuaningo@gmail.com
          </Text>
        </Text>

        <Text style={globalStyles.title}>License</Text>
        <Text style={[globalStyles.text, styles.customText]}>
          This app is licensed under the MIT License.
        </Text>

        <Text style={globalStyles.title}>Version</Text>
        <Text style={[globalStyles.text, styles.customText]}>{appVersion}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  customText: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: "justify",
  },
  link: {
    color: "blue",
    textDecorationLine: "underline",
  },
});
