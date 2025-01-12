import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import BackButton from "@components/layout/BackButton";
import {
  SectionTitle,
  SectionText,
  LinkText,
  Paragraph,
} from "@components/typography";
import { useAbout } from "@hooks/useAbout";

export default function AboutScreen() {
  const { appVersion, handleLinkPress, navigateToPrivacyPolicy } = useAbout();

  return (
    <ScrollView>
      <BackButton />
      <SectionTitle>About Lithuaningo</SectionTitle>
      <Paragraph style={styles.justifiedText}>
        Lithuaningo is your gateway to mastering Lithuanian! Dive into learning
        with ease and fun. Our app provides a comprehensive learning experience
        with various features and tools to help you become proficient in
        Lithuanian.
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
      <LinkText onPress={navigateToPrivacyPolicy}>
        View our Privacy Policy
      </LinkText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  justifiedText: {
    textAlign: "justify",
  },
});
