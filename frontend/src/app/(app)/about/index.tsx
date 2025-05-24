import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useAbout } from '@hooks/useAbout';
import { useAppInfo } from '@hooks/useAppInfo';
import CustomText from '@components/ui/CustomText';
import { useTheme } from 'react-native-paper';

const AboutScreen = () => {
  const {
    links,
    handleLinkPress,
    navigateToPrivacyPolicy,
    navigateToTermsOfService,
  } = useAbout();
  const { currentVersion, appInfo, openUpdateUrl } = useAppInfo();
  const theme = useTheme();

  // Check if there's a newer version available
  const hasUpdate =
    appInfo?.currentVersion && currentVersion !== appInfo.currentVersion;

  return (
    <ScrollView>
      <CustomText style={styles.justifiedText}>
        Lithuaningo is your gateway to mastering Lithuanian! Dive into learning
        with ease and fun. Our app provides a comprehensive learning experience
        with various features and tools to help you become proficient in
        Lithuanian.
      </CustomText>

      <CustomText variant="titleMedium" bold>
        Contact Us
      </CustomText>
      <CustomText>
        Email:{' '}
        <CustomText
          onPress={() => handleLinkPress(links.email)}
          style={[styles.link, { color: theme.colors.primary }]}
        >
          {links.email.value}
        </CustomText>
      </CustomText>

      <CustomText variant="titleMedium" bold>
        Legal
      </CustomText>
      <CustomText
        onPress={navigateToPrivacyPolicy}
        style={[styles.link, { color: theme.colors.primary }]}
      >
        {links.privacyPolicy.label}
      </CustomText>
      <CustomText
        onPress={navigateToTermsOfService}
        style={[styles.link, { color: theme.colors.primary }]}
      >
        {links.termsOfService.label}
      </CustomText>

      <CustomText variant="titleMedium" bold>
        License
      </CustomText>
      <CustomText>This app is licensed under the MIT License.</CustomText>

      <CustomText variant="titleMedium" bold>
        Version
      </CustomText>
      <CustomText>{currentVersion}</CustomText>

      {hasUpdate && (
        <CustomText
          style={[styles.link, { color: theme.colors.primary }]}
          onPress={openUpdateUrl}
        >
          New version available: {appInfo.currentVersion}
        </CustomText>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  justifiedText: {
    textAlign: 'justify',
    marginBottom: 20,
  },
  link: {
    textDecorationLine: 'underline',
  },
});

export default AboutScreen;
