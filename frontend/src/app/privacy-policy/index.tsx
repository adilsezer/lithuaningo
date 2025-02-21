import React from "react";
import { ScrollView, StyleSheet, StyleProp, TextStyle } from "react-native";
import BackButton from "@components/ui/BackButton";
import * as Linking from "expo-linking";
import CustomText from "@components/ui/CustomText";

// Define a local union type for the variants used here.
type ValidVariant = "titleLarge" | "titleMedium" | "bodyMedium";

// Define a helper type for the paragraph props.
interface ParagraphProps {
  variant: ValidVariant;
  style: StyleProp<TextStyle>;
}

const PrivacyPolicy = () => {
  // Create a helper object for body text props.
  const paragraphProps: ParagraphProps = {
    variant: "bodyMedium",
    style: styles.justifiedText,
  };

  return (
    <ScrollView>
      <BackButton />

      {/* Heading */}
      <CustomText variant="titleLarge" bold>
        Privacy Policy
      </CustomText>

      {/* Use paragraphProps for body text */}
      <CustomText {...paragraphProps}>Last updated: June 10, 2024</CustomText>

      <CustomText {...paragraphProps}>
        Thank you for choosing Lithuaningo ("us", "we", or "our"). This Privacy
        Policy explains how we collect, use, and disclose information about you
        when you use our mobile application ("App").
      </CustomText>

      <CustomText {...paragraphProps}>
        By using the App, you agree to the collection and use of information in
        accordance with this Privacy Policy.
      </CustomText>

      {/* Section Heading */}
      <CustomText variant="titleMedium" bold>
        1. Information We Collect
      </CustomText>

      <CustomText {...paragraphProps}>
        We collect the following types of information:
      </CustomText>

      <CustomText {...paragraphProps}>
        • Personal Information: When you register for an account, we may collect
        personal information such as your name, email address, and profile
        picture.
      </CustomText>
      <CustomText {...paragraphProps}>
        • Authentication Data: Information related to your authentication method
        (Email, Google Sign-In, or Apple Sign-In).
      </CustomText>
      <CustomText {...paragraphProps}>
        • Usage Data: We collect information on how you access and use the App,
        including:
      </CustomText>
      <CustomText
        {...paragraphProps}
        style={[paragraphProps.style, styles.nestedList]}
      >
        ○ Device information (IP address, browser type, browser version)
      </CustomText>
      <CustomText
        {...paragraphProps}
        style={[paragraphProps.style, styles.nestedList]}
      >
        ○ App access patterns and navigation
      </CustomText>
      <CustomText
        {...paragraphProps}
        style={[paragraphProps.style, styles.nestedList]}
      >
        ○ Learning progress and interaction data
      </CustomText>
      <CustomText
        {...paragraphProps}
        style={[paragraphProps.style, styles.nestedList]}
      >
        ○ Quiz responses and performance metrics
      </CustomText>
      <CustomText {...paragraphProps}>
        • Customer Support Data: Data generated during customer support
        requests.
      </CustomText>
      <CustomText {...paragraphProps}>
        • User Content: User-generated content such as quiz answers and learning
        interactions.
      </CustomText>
      <CustomText {...paragraphProps}>
        • Performance Data: Technical information about app performance,
        including:
      </CustomText>
      <CustomText
        {...paragraphProps}
        style={[paragraphProps.style, styles.nestedList]}
      >
        ○ App launch times and usage patterns
      </CustomText>
      <CustomText
        {...paragraphProps}
        style={[paragraphProps.style, styles.nestedList]}
      >
        ○ Crash reports and error logs
      </CustomText>
      <CustomText
        {...paragraphProps}
        style={[paragraphProps.style, styles.nestedList]}
      >
        ○ Device performance metrics
      </CustomText>
      <CustomText
        {...paragraphProps}
        style={[paragraphProps.style, styles.nestedList]}
      >
        ○ Network connectivity status
      </CustomText>
      <CustomText {...paragraphProps}>
        • Notification Preferences: Your preferences for daily review reminders
        and other notifications.
      </CustomText>

      {/* Section Heading */}
      <CustomText variant="titleMedium" bold>
        2. How We Use Your Information
      </CustomText>
      <CustomText {...paragraphProps}>
        We use the collected information for:
      </CustomText>
      <CustomText {...paragraphProps}>
        • Providing and maintaining our App
      </CustomText>
      <CustomText {...paragraphProps}>
        • Personalizing your learning experience
      </CustomText>
      <CustomText {...paragraphProps}>
        • Tracking your progress and generating statistics
      </CustomText>
      <CustomText {...paragraphProps}>
        • Managing user authentication and account security
      </CustomText>
      <CustomText {...paragraphProps}>
        • Sending daily review reminders and notifications
      </CustomText>
      <CustomText {...paragraphProps}>
        • Analyzing app performance and user behavior
      </CustomText>
      <CustomText {...paragraphProps}>
        • Detecting and addressing technical issues
      </CustomText>
      <CustomText {...paragraphProps}>
        • Improving our educational content and features
      </CustomText>

      {/* Section Heading */}
      <CustomText variant="titleMedium" bold>
        3. Data Storage and Security
      </CustomText>
      <CustomText {...paragraphProps}>
        • We use Firebase Authentication for secure user management
      </CustomText>
      <CustomText {...paragraphProps}>
        • Local data is stored securely using AsyncStorage
      </CustomText>
      <CustomText {...paragraphProps}>
        • Crash reports and analytics are handled through Firebase Crashlytics
      </CustomText>
      <CustomText {...paragraphProps}>
        • We implement industry-standard security measures to protect your data
      </CustomText>

      {/* Section Heading */}
      <CustomText variant="titleMedium" bold>
        4. Third-Party Services
      </CustomText>
      <CustomText {...paragraphProps}>
        We use the following third-party services:
      </CustomText>
      <CustomText {...paragraphProps}>
        • Google Sign-In for authentication
      </CustomText>
      <CustomText {...paragraphProps}>
        • Apple Sign-In for authentication
      </CustomText>
      <CustomText {...paragraphProps}>
        • Firebase for backend services
      </CustomText>
      <CustomText {...paragraphProps}>• Expo for app functionality</CustomText>
      <CustomText {...paragraphProps}>
        • Firebase Crashlytics for crash reporting
      </CustomText>
      <CustomText {...paragraphProps}>
        Each third-party service has its own privacy policy and data handling
        practices.
      </CustomText>

      {/* Section Heading */}
      <CustomText variant="titleMedium" bold>
        5. Data Deletion
      </CustomText>
      <CustomText {...paragraphProps}>
        You can request account deletion through the app's profile settings.
        When you delete your account:
      </CustomText>
      <CustomText {...paragraphProps}>
        • All personal information will be permanently removed
      </CustomText>
      <CustomText {...paragraphProps}>
        • Learning progress and statistics will be deleted
      </CustomText>
      <CustomText {...paragraphProps}>
        • User-generated content will be removed from our systems
      </CustomText>

      {/* Section Heading */}
      <CustomText variant="titleMedium" bold>
        6. Updates and Notifications
      </CustomText>
      <CustomText {...paragraphProps}>
        • You can manage notification preferences in the app settings
      </CustomText>
      <CustomText {...paragraphProps}>
        • Daily review reminders can be customized or disabled
      </CustomText>
      <CustomText {...paragraphProps}>
        • App updates and maintenance notifications may be sent when necessary
      </CustomText>

      {/* Section Heading */}
      <CustomText variant="titleMedium" bold>
        7. Children's Privacy
      </CustomText>
      <CustomText {...paragraphProps}>
        Our App is suitable for ages 4 and up. We do not knowingly collect
        personally identifiable information from children under 13 without
        parental consent.
      </CustomText>

      {/* Section Heading */}
      <CustomText variant="titleMedium" bold>
        8. Contact Us
      </CustomText>
      <CustomText {...paragraphProps}>
        If you have questions about this Privacy Policy, please contact us:
      </CustomText>
      <CustomText {...paragraphProps}>
        By email:{" "}
        <CustomText
          {...paragraphProps}
          style={[paragraphProps.style, styles.link]}
          onPress={() => Linking.openURL("mailto:lithuaningo@gmail.com")}
        >
          lithuaningo@gmail.com
        </CustomText>
      </CustomText>
      <CustomText {...paragraphProps}>
        By visiting this page on our website:{" "}
        <CustomText
          {...paragraphProps}
          style={[paragraphProps.style, styles.link]}
          onPress={() =>
            Linking.openURL(
              "https://adilsezer.github.io/lithuaningo/privacy-policy"
            )
          }
        >
          Privacy Policy URL
        </CustomText>
      </CustomText>

      {/* Section Heading */}
      <CustomText variant="titleMedium" bold>
        9. Changes to This Policy
      </CustomText>
      <CustomText {...paragraphProps}>
        We may update this Privacy Policy periodically. We will notify you of
        any changes by posting the new Privacy Policy on this page and updating
        the "Last updated" date.
      </CustomText>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  justifiedText: {
    textAlign: "justify",
  },
  nestedList: {
    paddingLeft: 20,
  },
  link: {
    color: "#0000FF",
    textDecorationLine: "underline",
  },
});

export default PrivacyPolicy;
