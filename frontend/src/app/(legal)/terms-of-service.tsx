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

const TermsOfService = () => {
  // Create a helper object for body text props
  const paragraphProps: ParagraphProps = {
    variant: "bodyMedium",
    style: styles.justifiedText,
  };

  return (
    <ScrollView>
      <CustomText {...paragraphProps}>Last updated: June 15, 2025</CustomText>

      <CustomText variant="titleMedium" bold>
        1. Age Requirements and Eligibility
      </CustomText>

      <CustomText {...paragraphProps}>
        By using Lithuaningo, you represent that:
      </CustomText>

      <CustomText {...paragraphProps}>
        • You are at least 13 years old
      </CustomText>

      <CustomText {...paragraphProps}>
        • If you are under 18, you have obtained parental consent
      </CustomText>

      <CustomText {...paragraphProps}>
        • You have the legal capacity to enter into these terms
      </CustomText>

      <CustomText {...paragraphProps}>
        • You will comply with all applicable laws and regulations
      </CustomText>

      <CustomText {...paragraphProps}>
        • Users under 13 are prohibited from creating accounts or using our
        services
      </CustomText>

      <CustomText variant="titleMedium" bold>
        2. Service Overview
      </CustomText>

      <CustomText {...paragraphProps}>
        Lithuaningo is a language learning app that provides AI-powered features
        including flashcards, challenges, and educational content to help you
        learn Lithuanian.
      </CustomText>

      <CustomText variant="titleMedium" bold>
        3. AI Services and Generated Content
      </CustomText>

      <CustomText {...paragraphProps}>
        Our app includes AI-powered features:
      </CustomText>

      <CustomText {...paragraphProps}>
        • AI-generated flashcards, images, and audio for learning purposes
      </CustomText>

      <CustomText {...paragraphProps}>
        • Chat responses for educational guidance only
      </CustomText>

      <CustomText {...paragraphProps}>
        • AI explanations as educational tools, not formal instruction
        replacement
      </CustomText>

      <CustomText {...paragraphProps}>
        • We strive for accuracy but cannot guarantee error-free AI content
      </CustomText>

      <CustomText {...paragraphProps}>
        • Users should verify important information from multiple sources
      </CustomText>

      <CustomText variant="titleMedium" bold>
        4. User Content and Ownership
      </CustomText>

      <CustomText {...paragraphProps}>When creating content, you:</CustomText>

      <CustomText {...paragraphProps}>
        • Retain ownership while granting us a license to use, modify, and
        distribute it
      </CustomText>

      <CustomText {...paragraphProps}>
        • Warrant you have all necessary rights to share the content
      </CustomText>

      <CustomText {...paragraphProps}>
        • Accept we may use your content for service improvement and AI training
      </CustomText>

      <CustomText {...paragraphProps}>
        • Understand AI-generated content is subject to our content policies
      </CustomText>

      <CustomText variant="titleMedium" bold>
        5. Content Guidelines
      </CustomText>

      <CustomText {...paragraphProps}>
        You agree not to create or share content that:
      </CustomText>

      <CustomText {...paragraphProps}>
        • Infringes intellectual property rights or contains hate speech
      </CustomText>

      <CustomText {...paragraphProps}>
        • Includes inappropriate, adult, or discriminatory content
      </CustomText>

      <CustomText {...paragraphProps}>
        • Promotes illegal activities, violence, or contains malware
      </CustomText>

      <CustomText {...paragraphProps}>
        • Provides incorrect translations or misleading educational content
      </CustomText>

      <CustomText {...paragraphProps}>
        • Attempts to exploit AI services for non-educational purposes
      </CustomText>

      <CustomText variant="titleMedium" bold>
        6. Premium Subscriptions
      </CustomText>

      <CustomText {...paragraphProps}>
        Premium features are available through subscription:
      </CustomText>

      <CustomText {...paragraphProps}>
        • Payments processed through App Store (iOS) or Google Play (Android)
      </CustomText>

      <CustomText {...paragraphProps}>
        • Features include unlimited AI interactions and advanced learning tools
      </CustomText>

      <CustomText {...paragraphProps}>
        • Subscriptions auto-renew unless cancelled before renewal date
      </CustomText>

      <CustomText {...paragraphProps}>
        • Cancellation and refund policies follow platform store guidelines
      </CustomText>

      <CustomText {...paragraphProps}>
        • Premium features subject to fair use policies and reasonable limits
      </CustomText>

      <CustomText variant="titleMedium" bold>
        7. Public Content and Sharing
      </CustomText>

      <CustomText {...paragraphProps}>
        By using Lithuaningo, you acknowledge:
      </CustomText>

      <CustomText {...paragraphProps}>
        • All user-created content is public and visible to other users
      </CustomText>

      <CustomText {...paragraphProps}>
        • Your username will be displayed alongside your content
      </CustomText>

      <CustomText {...paragraphProps}>
        • Other users can use and learn from your content
      </CustomText>

      <CustomText {...paragraphProps}>
        • We may feature your content in promotional materials
      </CustomText>

      <CustomText variant="titleMedium" bold>
        8. Content Moderation
      </CustomText>

      <CustomText {...paragraphProps}>We reserve the right to:</CustomText>

      <CustomText {...paragraphProps}>
        • Review, modify, or remove any content without notice
      </CustomText>

      <CustomText {...paragraphProps}>
        • Suspend or terminate accounts violating these terms
      </CustomText>

      <CustomText {...paragraphProps}>
        • Use automated systems and AI for content moderation
      </CustomText>

      <CustomText {...paragraphProps}>
        • Limit or restrict AI service usage for policy violations
      </CustomText>

      <CustomText variant="titleMedium" bold>
        9. Data Processing and Third-Party Services
      </CustomText>

      <CustomText {...paragraphProps}>
        Your data may be processed by third-party services:
      </CustomText>

      <CustomText {...paragraphProps}>
        • Supabase, OpenAI, RevenueCat, and Cloudflare R2
      </CustomText>

      <CustomText {...paragraphProps}>
        • We comply with GDPR, COPPA, and applicable privacy regulations
      </CustomText>

      <CustomText {...paragraphProps}>
        • Data processing activities detailed in our Privacy Policy
      </CustomText>

      <CustomText {...paragraphProps}>
        • AI conversations temporarily stored in server memory, automatically
        cleared
      </CustomText>

      <CustomText variant="titleMedium" bold>
        10. Service Availability
      </CustomText>

      <CustomText {...paragraphProps}>
        • AI services depend on third-party providers and may have occasional
        outages
      </CustomText>

      <CustomText {...paragraphProps}>
        • We strive for 99% uptime but cannot guarantee uninterrupted service
      </CustomText>

      <CustomText {...paragraphProps}>
        • Premium features may have usage limits for fair access
      </CustomText>

      <CustomText variant="titleMedium" bold>
        11. Limitation of Liability
      </CustomText>

      <CustomText {...paragraphProps}>
        • We provide the service "as is" without warranties of any kind
      </CustomText>

      <CustomText {...paragraphProps}>
        • Not responsible for accuracy of user-generated translations or content
      </CustomText>

      <CustomText {...paragraphProps}>
        • AI-generated content is for educational purposes and may contain
        errors
      </CustomText>

      <CustomText {...paragraphProps}>
        • Not liable for damages arising from service use
      </CustomText>

      <CustomText {...paragraphProps}>
        • Our liability limited to amounts paid for services, where applicable
      </CustomText>

      <CustomText variant="titleMedium" bold>
        12. Indemnification
      </CustomText>

      <CustomText {...paragraphProps}>
        You agree to indemnify Lithuaningo from claims arising from:
      </CustomText>

      <CustomText {...paragraphProps}>
        • Your use of the service and content submissions
      </CustomText>

      <CustomText {...paragraphProps}>
        • Your violation of these terms or rights of others
      </CustomText>

      <CustomText {...paragraphProps}>
        • Misuse of AI services or circumventing usage policies
      </CustomText>

      <CustomText variant="titleMedium" bold>
        13. Changes to Terms
      </CustomText>

      <CustomText {...paragraphProps}>
        • We may modify these terms at any time with notice
      </CustomText>

      <CustomText {...paragraphProps}>
        • Continued use after changes constitutes acceptance
      </CustomText>

      <CustomText {...paragraphProps}>
        • Major changes communicated through the app or email
      </CustomText>

      <CustomText variant="titleMedium" bold>
        14. Governing Law
      </CustomText>

      <CustomText {...paragraphProps}>
        These Terms are governed by the laws of Lithuania. Disputes subject to
        exclusive jurisdiction of Lithuanian courts.
      </CustomText>

      <CustomText variant="titleMedium" bold>
        15. Contact Us
      </CustomText>

      <CustomText {...paragraphProps}>
        For questions about these terms:
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
        Complete Terms:{" "}
        <CustomText
          style={[paragraphProps.style, styles.link]}
          onPress={() =>
            Linking.openURL("https://lithuaningo.com/terms-of-service")
          }
        >
          View Full Terms Online
        </CustomText>
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

export default TermsOfService;
