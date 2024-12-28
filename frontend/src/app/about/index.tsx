import React from "react";
import { StyleSheet, ScrollView, Alert, View } from "react-native";
import * as Linking from "expo-linking";
import Constants from "expo-constants";
import BackButton from "@components/layout/BackButton";
import {
  SectionTitle,
  SectionText,
  LinkText,
  Paragraph,
} from "@components/typography";
import { useRouter } from "expo-router";

export default function AboutScreen() {
  const router = useRouter();

  const handleLinkPress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "Error",
          "Unable to open the link. Please check if the app to handle the URL is installed and configured."
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

  const appVersion = Constants.expoConfig?.version || "Unknown";

  return (
    <ScrollView>
      <BackButton />
      <View style={styles.container}>
        <SectionTitle>About Lithuaningo</SectionTitle>
        <Paragraph style={styles.justifiedText}>
          Lithuaningo is your gateway to mastering Lithuanian! Dive into
          learning with ease and fun. Our app provides a comprehensive learning
          experience with various features and tools to help you become
          proficient in Lithuanian.
        </Paragraph>

        <SectionTitle>Contact Us</SectionTitle>
        <SectionText>
          Email:{" "}
          <LinkText
            onPress={() => handleLinkPress("mailto:lithuaningo@gmail.com")}
          >
            lithuaningo@gmail.com
          </LinkText>
        </SectionText>

        <SectionTitle>License</SectionTitle>
        <SectionText>This app is licensed under the MIT License.</SectionText>

        <SectionTitle>Version</SectionTitle>
        <SectionText>{appVersion}</SectionText>

        <SectionTitle>Privacy Policy</SectionTitle>
        <LinkText onPress={() => router.push("/privacy-policy")}>
          View our Privacy Policy
        </LinkText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  justifiedText: {
    textAlign: "justify",
  },
});
