import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import BackButton from "@components/layout/BackButton";
import { useAbout } from "@hooks/useAbout";
import CustomText from "@components/ui/CustomText";

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
        <CustomText onPress={() => handleLinkPress(links.email)}>
          {links.email.value}
        </CustomText>
      </CustomText>

      <CustomText>Open Source</CustomText>
      <CustomText onPress={() => handleLinkPress(links.github)}>
        {links.github.label}
      </CustomText>

      <CustomText>Legal</CustomText>
      <CustomText onPress={navigateToPrivacyPolicy}>
        {links.privacyPolicy.label}
      </CustomText>
      <CustomText onPress={navigateToTermsOfService}>
        {links.termsOfService.label}
      </CustomText>

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
