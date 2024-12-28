import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import BackButton from "@components/layout/BackButton";
import { useThemeStyles } from "@hooks/useThemeStyles";
import {
  SectionTitle,
  Subtitle,
  Paragraph,
  LinkText,
} from "@components/typography";
import * as Linking from "expo-linking";

const PrivacyPolicy = () => {
  return (
    <ScrollView>
      <BackButton />
      <View style={styles.container}>
        <SectionTitle>Privacy Policy</SectionTitle>
        <Subtitle>Last updated: June 10, 2024</Subtitle>

        <Paragraph>
          Thank you for choosing Lithuaningo ("us", "we", or "our"). This
          Privacy Policy explains how we collect, use, and disclose information
          about you when you use our mobile application ("App").
        </Paragraph>

        <Paragraph>
          By using the App, you agree to the collection and use of information
          in accordance with this Privacy Policy.
        </Paragraph>

        <Subtitle>1. Information We Collect</Subtitle>
        <Paragraph>We collect the following types of information:</Paragraph>
        <Paragraph>
          • Personal Information: When you register for an account, we may
          collect personal information such as your name, email address, and
          profile picture.
        </Paragraph>
        <Paragraph>
          • Authentication Data: Information related to your authentication
          method (Email, Google Sign-In, or Apple Sign-In).
        </Paragraph>
        <Paragraph>
          • Usage Data: We collect information on how you access and use the
          App, including:
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
          • User Content: User-generated content such as quiz answers and
          learning interactions.
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
          • Notification Preferences: Your preferences for daily review
          reminders and other notifications.
        </Paragraph>

        <Subtitle>2. How We Use Your Information</Subtitle>
        <Paragraph>We use the collected information for:</Paragraph>
        <Paragraph>• Providing and maintaining our App</Paragraph>
        <Paragraph>• Personalizing your learning experience</Paragraph>
        <Paragraph>
          • Tracking your progress and generating statistics
        </Paragraph>
        <Paragraph>
          • Managing user authentication and account security
        </Paragraph>
        <Paragraph>
          • Sending daily review reminders and notifications
        </Paragraph>
        <Paragraph>• Analyzing app performance and user behavior</Paragraph>
        <Paragraph>• Detecting and addressing technical issues</Paragraph>
        <Paragraph>• Improving our educational content and features</Paragraph>

        <Subtitle>3. Data Storage and Security</Subtitle>
        <Paragraph>
          • We use Firebase Authentication for secure user management
        </Paragraph>
        <Paragraph>
          • Local data is stored securely using AsyncStorage
        </Paragraph>
        <Paragraph>
          • Crash reports and analytics are handled through Firebase Crashlytics
        </Paragraph>
        <Paragraph>
          • We implement industry-standard security measures to protect your
          data
        </Paragraph>

        <Subtitle>4. Third-Party Services</Subtitle>
        <Paragraph>We use the following third-party services:</Paragraph>
        <Paragraph>• Google Sign-In for authentication</Paragraph>
        <Paragraph>• Apple Sign-In for authentication</Paragraph>
        <Paragraph>• Firebase for backend services</Paragraph>
        <Paragraph>• Expo for app functionality</Paragraph>
        <Paragraph>• Firebase Crashlytics for crash reporting</Paragraph>
        <Paragraph>
          Each third-party service has its own privacy policy and data handling
          practices.
        </Paragraph>

        <Subtitle>5. Data Deletion</Subtitle>
        <Paragraph>
          You can request account deletion through the app's profile settings.
          When you delete your account:
        </Paragraph>
        <Paragraph>
          • All personal information will be permanently removed
        </Paragraph>
        <Paragraph>
          • Learning progress and statistics will be deleted
        </Paragraph>
        <Paragraph>
          • User-generated content will be removed from our systems
        </Paragraph>

        <Subtitle>6. Updates and Notifications</Subtitle>
        <Paragraph>
          • You can manage notification preferences in the app settings
        </Paragraph>
        <Paragraph>
          • Daily review reminders can be customized or disabled
        </Paragraph>
        <Paragraph>
          • App updates and maintenance notifications may be sent when necessary
        </Paragraph>

        <Subtitle>7. Children's Privacy</Subtitle>
        <Paragraph>
          Our App is suitable for ages 4 and up. We do not knowingly collect
          personally identifiable information from children under 13 without
          parental consent.
        </Paragraph>

        <Subtitle>8. Contact Us</Subtitle>
        <Paragraph>
          If you have questions about this Privacy Policy, please contact us:
        </Paragraph>
        <Paragraph>
          By email:{" "}
          <LinkText
            onPress={() => Linking.openURL("mailto:lithuaningo@gmail.com")}
          >
            lithuaningo@gmail.com
          </LinkText>
        </Paragraph>
        <Paragraph>
          By visiting this page on our website:{" "}
          <LinkText
            onPress={() =>
              Linking.openURL(
                "https://adilsezer.github.io/lithuaningo/privacy-policy"
              )
            }
          >
            Privacy Policy URL
          </LinkText>
        </Paragraph>

        <Subtitle>9. Changes to This Policy</Subtitle>
        <Paragraph>
          We may update this Privacy Policy periodically. We will notify you of
          any changes by posting the new Privacy Policy on this page and
          updating the "Last updated" date.
        </Paragraph>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  nestedList: {
    paddingLeft: 20,
  },
});

export default PrivacyPolicy;
