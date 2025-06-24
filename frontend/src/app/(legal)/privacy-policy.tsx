import React from "react";
import { ScrollView, StyleSheet, StyleProp, TextStyle } from "react-native";
import * as Linking from "expo-linking";
import CustomText from "@components/ui/CustomText";

// Define types for component props
type ValidVariant = "titleLarge" | "titleMedium" | "bodyMedium" | "titleSmall";

interface ParagraphProps {
  variant: ValidVariant;
  style: StyleProp<TextStyle>;
}

const PrivacyPolicy = () => {
  // Create a helper object for body text props
  const paragraphProps: ParagraphProps = {
    variant: "bodyMedium",
    style: styles.justifiedText,
  };

  return (
    <ScrollView>
      <CustomText {...paragraphProps}>Last updated: June 15, 2025</CustomText>

      <CustomText {...paragraphProps}>
        Thank you for choosing Lithuaningo ("us", "we", or "our"). This Privacy
        Policy explains how we collect, use, and disclose information about you
        when you use our mobile application ("App").
      </CustomText>

      <CustomText {...paragraphProps}>
        By using the App, you agree to the collection and use of information in
        accordance with this Privacy Policy.
      </CustomText>

      <CustomText variant="titleMedium" bold>
        1. Information We Collect
      </CustomText>

      <CustomText {...paragraphProps}>
        We collect the following types of information:
      </CustomText>

      <CustomText {...paragraphProps}>
        • Personal Information: Name, email address, profile picture,
        authentication data, subscription status
      </CustomText>

      <CustomText {...paragraphProps}>
        • Usage Data: App access patterns, learning progress, quiz performance,
        chat conversations with AI, device information
      </CustomText>

      <CustomText {...paragraphProps}>
        • AI-Generated Content: Chat conversations, personalized explanations,
        generated flashcards, computer-generated images, text-to-speech audio
      </CustomText>

      <CustomText {...paragraphProps}>
        • Technical Data: App performance metrics, crash reports, network
        connectivity, device specifications
      </CustomText>

      <CustomText variant="titleMedium" bold>
        2. How We Use Your Information
      </CustomText>

      <CustomText {...paragraphProps}>We use your information to:</CustomText>

      <CustomText {...paragraphProps}>
        • Provide personalized learning experiences with AI-powered features
      </CustomText>

      <CustomText {...paragraphProps}>
        • Track progress, manage authentication, and process subscriptions
      </CustomText>

      <CustomText {...paragraphProps}>
        • Generate AI content (flashcards, images, audio) and provide chat
        assistance
      </CustomText>

      <CustomText {...paragraphProps}>
        • Send notifications, analyze performance, and improve our services
      </CustomText>

      <CustomText variant="titleMedium" bold>
        3. Third-Party Services
      </CustomText>

      <CustomText {...paragraphProps}>
        We use the following services:
      </CustomText>

      <CustomText {...paragraphProps}>
        • Supabase: Authentication, database, and user management
      </CustomText>

      <CustomText {...paragraphProps}>
        • Google/Apple Sign-In: Authentication services
      </CustomText>

      <CustomText {...paragraphProps}>
        • RevenueCat: Subscription and payment processing
      </CustomText>

      <CustomText {...paragraphProps}>
        • OpenAI: AI-powered chat, content generation, image creation,
        text-to-speech
      </CustomText>

      <CustomText {...paragraphProps}>
        • Cloudflare R2: Secure media file storage
      </CustomText>

      <CustomText variant="titleMedium" bold>
        4. Data Storage and Security
      </CustomText>

      <CustomText {...paragraphProps}>
        • Primary data stored securely with Supabase (cloud hosting)
      </CustomText>

      <CustomText {...paragraphProps}>
        • Media files encrypted with Cloudflare R2 storage
      </CustomText>

      <CustomText {...paragraphProps}>
        • AI conversations temporarily stored in server memory, automatically
        cleared
      </CustomText>

      <CustomText {...paragraphProps}>
        • Local app data stored securely using AsyncStorage
      </CustomText>

      <CustomText {...paragraphProps}>
        • Industry-standard security measures and encryption protocols
      </CustomText>

      <CustomText variant="titleMedium" bold>
        5. Children's Privacy (COPPA Compliance)
      </CustomText>

      <CustomText {...paragraphProps}>
        Our app is intended for users 13 and older. We comply with COPPA and
        similar regulations:
      </CustomText>

      <CustomText {...paragraphProps}>
        • Users must be at least 13 years old to create accounts
      </CustomText>

      <CustomText {...paragraphProps}>
        • Parental consent required for users under 13
      </CustomText>

      <CustomText {...paragraphProps}>
        • If we discover a child under 13 has provided information, we delete it
        immediately
      </CustomText>

      <CustomText {...paragraphProps}>
        • Enhanced privacy protections for minors and educational focus
      </CustomText>

      <CustomText variant="titleMedium" bold>
        6. Your Rights and Data Control
      </CustomText>

      <CustomText {...paragraphProps}>You can:</CustomText>

      <CustomText {...paragraphProps}>
        • Access, update, and delete your data through app settings
      </CustomText>

      <CustomText {...paragraphProps}>
        • Export your learning data by contacting support
      </CustomText>

      <CustomText {...paragraphProps}>
        • Manage notification preferences and app permissions
      </CustomText>

      <CustomText {...paragraphProps}>
        • Withdraw consent for data processing by deleting your account
      </CustomText>

      <CustomText variant="titleMedium" bold>
        7. GDPR Rights (EU Users)
      </CustomText>

      <CustomText {...paragraphProps}>
        If you're in the EU, you have additional rights:
      </CustomText>

      <CustomText {...paragraphProps}>
        • Access, rectify, erase, restrict, or port your personal data
      </CustomText>

      <CustomText {...paragraphProps}>
        • Object to processing and withdraw consent at any time
      </CustomText>

      <CustomText {...paragraphProps}>
        • Right to be forgotten and data portability
      </CustomText>

      <CustomText variant="titleMedium" bold>
        8. Data Retention
      </CustomText>

      <CustomText {...paragraphProps}>
        • Learning data: Retained while your account is active
      </CustomText>

      <CustomText {...paragraphProps}>
        • AI conversations: Temporarily stored in server memory, automatically
        cleared
      </CustomText>

      <CustomText {...paragraphProps}>
        • Generated content: Retained for app functionality, deleted upon
        account deletion
      </CustomText>

      <CustomText {...paragraphProps}>
        • Analytics: Aggregated data retained for 2 years for service
        improvement
      </CustomText>

      <CustomText variant="titleMedium" bold>
        9. Device Permissions
      </CustomText>

      <CustomText {...paragraphProps}>
        We may request permissions for:
      </CustomText>

      <CustomText {...paragraphProps}>
        • Internet access, network state, storage access
      </CustomText>

      <CustomText {...paragraphProps}>
        • Notifications (with your consent), billing for subscriptions
      </CustomText>

      <CustomText {...paragraphProps}>
        • All permissions explained clearly and manageable through device
        settings
      </CustomText>

      <CustomText variant="titleMedium" bold>
        10. Contact Us
      </CustomText>

      <CustomText {...paragraphProps}>
        For privacy questions or to exercise your rights:
      </CustomText>

      <CustomText {...paragraphProps}>
        Email:{" "}
        <CustomText
          style={[paragraphProps.style, styles.link]}
          onPress={() => Linking.openURL("mailto:lithuaningo@gmail.com")}
        >
          lithuaningo@gmail.com
        </CustomText>
      </CustomText>

      <CustomText {...paragraphProps}>
        Complete Privacy Policy:{" "}
        <CustomText
          style={[paragraphProps.style, styles.link]}
          onPress={() =>
            Linking.openURL("https://lithuaningo.com/privacy-policy")
          }
        >
          View Full Policy Online
        </CustomText>
      </CustomText>

      <CustomText variant="titleMedium" bold>
        11. Policy Updates
      </CustomText>

      <CustomText {...paragraphProps}>
        We may update this policy to reflect new features, AI capabilities, and
        regulatory changes. Continued use after updates constitutes acceptance
        of the revised policy.
      </CustomText>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  justifiedText: {
    textAlign: "justify",
    marginBottom: 12,
    lineHeight: 20,
  },
  link: {
    textDecorationLine: "underline",
    color: "#0066CC",
  },
});

export default PrivacyPolicy;
