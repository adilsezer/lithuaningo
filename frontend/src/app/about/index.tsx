import React from "react";
import { Text, StyleSheet, ScrollView, Alert, View } from "react-native";
import * as Linking from "expo-linking";
import Constants from "expo-constants";
import BackButton from "@components/layout/BackButton";
import { useThemeStyles } from "@hooks/useThemeStyles";
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

  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const appVersion = Constants.expoConfig?.version || "Unknown";

  return (
    <ScrollView>
      <BackButton />
      <View style={styles.container}>
        <Text style={globalStyles.title}>About Lithuaningo</Text>

        <Text style={[globalStyles.text, { textAlign: "justify" }]}>
          Lithuaningo is your gateway to mastering Lithuanian! Dive into
          learning with ease and fun. Our app provides a comprehensive learning
          experience with various features and tools to help you become
          proficient in Lithuanian.
        </Text>

        <Text style={globalStyles.title}>Contact Us</Text>
        <Text style={[globalStyles.text]}>
          Email:{" "}
          <Text
            style={[
              globalStyles.text,
              { color: globalColors.link, textDecorationLine: "underline" },
            ]}
            onPress={() => handleLinkPress("mailto:lithuaningo@gmail.com")}
          >
            lithuaningo@gmail.com
          </Text>
        </Text>

        <Text style={globalStyles.title}>License</Text>
        <Text style={[globalStyles.text]}>
          This app is licensed under the MIT License.
        </Text>

        <Text style={globalStyles.title}>Version</Text>
        <Text style={[globalStyles.text]}>{appVersion}</Text>

        <Text style={globalStyles.title}>Privacy Policy</Text>
        <Text
          style={[
            globalStyles.text,
            { color: globalColors.link, textDecorationLine: "underline" },
          ]}
          onPress={() => router.push("/privacy-policy")}
        >
          View our Privacy Policy
        </Text>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});
