import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { useAbout } from "@hooks/useAbout";
import { useAppInfo } from "@hooks/useAppInfo";
import CustomText from "@components/ui/CustomText";
import { useTheme } from "react-native-paper";
import HeaderWithBackButton from "@components/layout/HeaderWithBackButton";
const AboutScreen = () => {
  const {
    links,
    handleLinkPress,
    navigateToPrivacyPolicy,
    navigateToTermsOfService,
  } = useAbout();
  const { versionInfo } = useAppInfo();
  const theme = useTheme();

  return (
    <ScrollView>
      <HeaderWithBackButton title="About Lithuaningo" />
      <CustomText style={[styles.justifiedText]}>
        Lithuaningo is your gateway to mastering Lithuanian! Dive into learning
        with ease and fun. Our app provides a comprehensive learning experience
        with various features and tools to help you become proficient in
        Lithuanian.
      </CustomText>

      <CustomText variant="titleMedium" bold>
        Contact Us
      </CustomText>
      <CustomText>
        Email:{" "}
        <CustomText
          onPress={() => handleLinkPress(links.email)}
          style={styles.link}
        >
          {links.email.value}
        </CustomText>
      </CustomText>

      <CustomText variant="titleMedium" bold>
        Legal
      </CustomText>
      <CustomText onPress={navigateToPrivacyPolicy} style={styles.link}>
        {links.privacyPolicy.label}
      </CustomText>
      <CustomText onPress={navigateToTermsOfService} style={styles.link}>
        {links.termsOfService.label}
      </CustomText>

      <CustomText variant="titleMedium" bold>
        License
      </CustomText>
      <CustomText>This app is licensed under the MIT License.</CustomText>

      <CustomText variant="titleMedium" bold>
        Version
      </CustomText>
      <CustomText>{versionInfo.current}</CustomText>
      {versionInfo.latest && versionInfo.current !== versionInfo.latest && (
        <CustomText style={{ color: theme.colors.primary }}>
          New version available: {versionInfo.latest}
        </CustomText>
      )}
    </ScrollView>
  );
};

export default AboutScreen;

const styles = StyleSheet.create({
  justifiedText: {
    textAlign: "justify",
  },
  link: {
    color: "#0000FF",
    textDecorationLine: "underline",
  },
});
