import React from "react";
import { Text, StyleSheet, ScrollView } from "react-native";
import * as Linking from "expo-linking";
import Constants from "expo-constants";
import BackButton from "@components/BackButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

export default function AboutScreen() {
  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err),
    );
  };

  const { styles: globalStyles } = useThemeStyles();
  const appVersion = Constants.expoConfig?.version || "Unknown";

  return (
    <ScrollView>
      <BackButton />
      <Text style={globalStyles.title}>About Lithuaningo</Text>
      <Text style={[globalStyles.text, styles.customText]}>
        Lithuaningo is your gateway to mastering Lithuanian! Dive into learning
        with ease and fun. Our app provides a comprehensive learning experience
        with various features and tools to help you become proficient in
        Lithuanian.
      </Text>

      <Text style={globalStyles.title}>Contact Us</Text>
      <Text style={[globalStyles.text, styles.customText]}>
        Email:{" "}
        <Text
          style={globalStyles.text}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  customText: {
    fontSize: 16,
    margin: 10,
    textAlign: "justify",
  },
});
