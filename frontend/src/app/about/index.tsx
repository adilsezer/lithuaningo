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

const AboutScreen = () => {
  const {
    appVersion,
    links,
    handleLinkPress,
    navigateToPrivacyPolicy,
    navigateToTermsOfService,
  } = useAbout();

  return (
    <ScrollView>
      <BackButton />

      <SectionTitle>About Lithuaningo</SectionTitle>
      <Paragraph style={[styles.justifiedText]}>
        Lithuaningo is your gateway to mastering Lithuanian! Dive into learning
        with ease and fun. Our app provides a comprehensive learning experience
        with various features and tools to help you become proficient in
        Lithuanian.
      </Paragraph>

      <SectionTitle>Contact Us</SectionTitle>
      <SectionText>
        Email:{" "}
        <LinkText onPress={() => handleLinkPress(links.email)}>
          {links.email.value}
        </LinkText>
      </SectionText>

      <SectionTitle>Open Source</SectionTitle>
      <LinkText onPress={() => handleLinkPress(links.github)}>
        {links.github.label}
      </LinkText>

      <SectionTitle>Legal</SectionTitle>
      <LinkText onPress={navigateToPrivacyPolicy}>
        {links.privacyPolicy.label}
      </LinkText>
      <LinkText onPress={navigateToTermsOfService}>
        {links.termsOfService.label}
      </LinkText>

      <SectionTitle>License</SectionTitle>
      <SectionText>This app is licensed under the MIT License.</SectionText>

      <SectionTitle>Version</SectionTitle>
      <SectionText>{appVersion}</SectionText>
    </ScrollView>
  );
};

export default AboutScreen;

const styles = StyleSheet.create({
  justifiedText: {
    textAlign: "justify",
  },
});
