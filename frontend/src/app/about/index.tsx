import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import BackButton from "@components/layout/BackButton";
import { useAbout } from "@hooks/useAbout";
import CustomText from "@components/typography/CustomText";
import { LinkText } from "@components/typography";

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

      <CustomText>About Lithuaningo</CustomText>
      <CustomText style={[styles.justifiedText]}>
        Lithuaningo is your gateway to mastering Lithuanian! Dive into learning
        with ease and fun. Our app provides a comprehensive learning experience
        with various features and tools to help you become proficient in
        Lithuanian.
      </CustomText>

      <CustomText>Contact Us</CustomText>
      <CustomText>
        Email:{" "}
        <LinkText onPress={() => handleLinkPress(links.email)}>
          {links.email.value}
        </LinkText>
      </CustomText>

      <CustomText>Open Source</CustomText>
      <LinkText onPress={() => handleLinkPress(links.github)}>
        {links.github.label}
      </LinkText>

      <CustomText>Legal</CustomText>
      <LinkText onPress={navigateToPrivacyPolicy}>
        {links.privacyPolicy.label}
      </LinkText>
      <LinkText onPress={navigateToTermsOfService}>
        {links.termsOfService.label}
      </LinkText>

      <CustomText>License</CustomText>
      <CustomText>This app is licensed under the MIT License.</CustomText>

      <CustomText>{appVersion}</CustomText>
    </ScrollView>
  );
};

export default AboutScreen;

const styles = StyleSheet.create({
  justifiedText: {
    textAlign: "justify",
  },
});
