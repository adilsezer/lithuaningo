import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import BackButton from "@components/layout/BackButton";
import * as Linking from "expo-linking";
import CustomText from "@components/ui/CustomText";
import { Paragraph } from "react-native-paper";

const PrivacyPolicy = () => {
  return (
    <ScrollView>
      <BackButton />
      <CustomText>Privacy Policy</CustomText>
      <CustomText>Last updated: June 10, 2024</CustomText>

      <CustomText>
        Thank you for choosing Lithuaningo ("us", "we", or "our"). This Privacy
        Policy explains how we collect, use, and disclose information about you
        when you use our mobile application ("App").
      </CustomText>

      <CustomText>
        By using the App, you agree to the collection and use of information in
        accordance with this Privacy Policy.
      </CustomText>

      <CustomText>1. Information We Collect</CustomText>
      <CustomText>We collect the following types of information:</CustomText>
      <CustomText>
        • Personal Information: When you register for an account, we may collect
        personal information such as your name, email address, and profile
        picture.
      </CustomText>
      <Paragraph>
        • Authentication Data: Information related to your authentication method
        (Email, Google Sign-In, or Apple Sign-In).
      </Paragraph>
      <Paragraph>
        • Usage Data: We collect information on how you access and use the App,
        including:
      </Paragraph>
      <Paragraph style={styles.nestedList}>
        ○ Device information (IP address, browser type, browser version)
      </Paragraph>
      <Paragraph style={styles.nestedList}>
        ○ App access patterns and navigation
      </Paragraph>
      <Paragraph style={styles.nestedList}>
        ○ Learning progress and interaction data
      </Paragraph>
      <Paragraph style={styles.nestedList}>
        ○ Quiz responses and performance metrics
      </Paragraph>
      <Paragraph>
        • Customer Support Data: Data generated during customer support
        requests.
      </Paragraph>
      <Paragraph>
        • User Content: User-generated content such as quiz answers and learning
        interactions.
      </Paragraph>
      <Paragraph>
        • Performance Data: Technical information about app performance,
        including:
      </Paragraph>
      <Paragraph style={styles.nestedList}>
        ○ App launch times and usage patterns
      </Paragraph>
      <Paragraph style={styles.nestedList}>
        ○ Crash reports and error logs
      </Paragraph>
      <Paragraph style={styles.nestedList}>
        ○ Device performance metrics
      </Paragraph>
      <Paragraph style={styles.nestedList}>
        ○ Network connectivity status
      </Paragraph>
      <Paragraph>
        • Notification Preferences: Your preferences for daily review reminders
        and other notifications.
      </Paragraph>

      <CustomText>2. How We Use Your Information</CustomText>
      <CustomText>We use the collected information for:</CustomText>
      <CustomText>• Providing and maintaining our App</CustomText>
      <CustomText>• Personalizing your learning experience</CustomText>
      <CustomText>
        • Tracking your progress and generating statistics
      </CustomText>
      <CustomText>
        • Managing user authentication and account security
      </CustomText>
      <CustomText>
        • Sending daily review reminders and notifications
      </CustomText>
      <CustomText>• Analyzing app performance and user behavior</CustomText>
      <CustomText>• Detecting and addressing technical issues</CustomText>
      <CustomText>• Improving our educational content and features</CustomText>

      <CustomText>3. Data Storage and Security</CustomText>
      <CustomText>
        • We use Firebase Authentication for secure user management
      </CustomText>
      <CustomText>
        • Local data is stored securely using AsyncStorage
      </CustomText>
      <CustomText>
        • Crash reports and analytics are handled through Firebase Crashlytics
      </CustomText>
      <CustomText>
        • We implement industry-standard security measures to protect your data
      </CustomText>

      <CustomText>4. Third-Party Services</CustomText>
      <CustomText>We use the following third-party services:</CustomText>
      <CustomText>• Google Sign-In for authentication</CustomText>
      <CustomText>• Apple Sign-In for authentication</CustomText>
      <CustomText>• Firebase for backend services</CustomText>
      <CustomText>• Expo for app functionality</CustomText>
      <CustomText>• Firebase Crashlytics for crash reporting</CustomText>
      <CustomText>
        Each third-party service has its own privacy policy and data handling
        practices.
      </CustomText>

      <CustomText>5. Data Deletion</CustomText>
      <CustomText>
        You can request account deletion through the app's profile settings.
        When you delete your account:
      </CustomText>
      <CustomText>
        • All personal information will be permanently removed
      </CustomText>
      <CustomText>
        • Learning progress and statistics will be deleted
      </CustomText>
      <CustomText>
        • User-generated content will be removed from our systems
      </CustomText>

      <CustomText>6. Updates and Notifications</CustomText>
      <CustomText>
        • You can manage notification preferences in the app settings
      </CustomText>
      <CustomText>
        • Daily review reminders can be customized or disabled
      </CustomText>
      <CustomText>
        • App updates and maintenance notifications may be sent when necessary
      </CustomText>

      <CustomText>7. Children's Privacy</CustomText>
      <CustomText>
        Our App is suitable for ages 4 and up. We do not knowingly collect
        personally identifiable information from children under 13 without
        parental consent.
      </CustomText>

      <CustomText>8. Contact Us</CustomText>
      <CustomText>
        If you have questions about this Privacy Policy, please contact us:
      </CustomText>
      <CustomText>
        By email:{" "}
        <CustomText
          onPress={() => Linking.openURL("mailto:lithuaningo@gmail.com")}
        >
          lithuaningo@gmail.com
        </CustomText>
      </CustomText>
      <CustomText>
        By visiting this page on our website:{" "}
        <CustomText
          onPress={() =>
            Linking.openURL(
              "https://adilsezer.github.io/lithuaningo/privacy-policy"
            )
          }
        >
          Privacy Policy URL
        </CustomText>
      </CustomText>

      <CustomText>9. Changes to This Policy</CustomText>
      <CustomText>
        We may update this Privacy Policy periodically. We will notify you of
        any changes by posting the new Privacy Policy on this page and updating
        the "Last updated" date.
      </CustomText>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  nestedList: {
    paddingLeft: 20,
  },
});

export default PrivacyPolicy;
