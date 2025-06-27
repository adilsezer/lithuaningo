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
    <ScrollView showsVerticalScrollIndicator={false}>
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
        6. Premium Subscriptions, Payments, and Renewals
      </CustomText>

      <CustomText variant="titleSmall" bold>
        a. Subscription Plans
      </CustomText>
      <CustomText {...paragraphProps}>
        We offer various subscription plans that provide access to enhanced
        features and content ("Premium Services"). The features, limits, and
        subscription types (e.g., monthly, yearly, multi-year) are described
        within the App at the time of purchase. All payments are processed
        through the respective mobile platform's app store (Apple App Store or
        Google Play Store), and are subject to their terms and conditions.
      </CustomText>

      <CustomText variant="titleSmall" bold>
        b. Billing and Automatic Renewal
      </CustomText>
      <CustomText {...paragraphProps}>
        Subscriptions are billed in advance on a recurring and periodic basis
        ("Billing Cycle"). Your subscription will automatically renew at the end
        of each Billing Cycle under the same conditions unless you cancel it or
        we cancel it. You must cancel your subscription through your App Store
        or Google Play Store account settings at least 24 hours before the
        renewal date to avoid being charged for the next Billing Cycle.
      </CustomText>

      <CustomText variant="titleSmall" bold>
        c. Subscription Fees and Price Changes
      </CustomText>
      <CustomText {...paragraphProps}>
        We reserve the right to modify the subscription fees for the Premium
        Services at any time. Any fee change will become effective at the end of
        the then-current Billing Cycle. We will provide you with reasonable
        prior notice of any change in subscription fees to give you an
        opportunity to terminate your subscription before such change becomes
        effective. Your continued use of the Premium Services after the
        subscription fee change comes into effect constitutes your agreement to
        pay the modified subscription fee amount.
      </CustomText>

      <CustomText variant="titleSmall" bold>
        d. Refunds
      </CustomText>
      <CustomText {...paragraphProps}>
        Except when required by law or by the policies of the Apple App Store or
        Google Play Store, paid subscription fees are non-refundable. We do not
        provide refunds or credits for any partial subscription periods or
        unused content.
      </CustomText>

      <CustomText variant="titleSmall" bold>
        e. Subscription Content
      </CustomText>
      <CustomText {...paragraphProps}>
        Our Premium Services may include access to a regularly updated library
        of flashcards and a periodic allotment of new, AI-generated flashcards.
        The exact number of new flashcards and the scope of other premium
        features are subject to change and are described within the App. We do
        not guarantee that any specific content will be available for any
        minimum period.
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
        12. Our Intellectual Property
      </CustomText>
      <CustomText {...paragraphProps}>
        The Service and its original content (excluding content provided by
        users), features, and functionality are and will remain the exclusive
        property of Lithuaningo and its licensors. The Service is protected by
        copyright, trademark, and other laws of both Lithuania and foreign
        countries. Our trademarks and trade dress may not be used in connection
        with any product or service without the prior written consent of
        Lithuaningo. You are granted a limited, non-exclusive, non-transferable,
        revocable license to access and use the Service for your personal,
        non-commercial use.
      </CustomText>

      <CustomText variant="titleMedium" bold>
        13. Indemnification
      </CustomText>

      <CustomText {...paragraphProps}>
        You agree to indemnify, defend, and hold harmless Lithuaningo and its
        affiliates, officers, directors, employees, and agents from and against
        any and all claims, liabilities, damages, losses, costs, expenses, or
        fees (including reasonable attorneys' fees) that such parties may incur
        as a result of or arising from your (or anyone using your account's)
        violation of these Terms.
      </CustomText>

      <CustomText variant="titleMedium" bold>
        14. Termination
      </CustomText>

      <CustomText {...paragraphProps}>
        We may terminate or suspend your account and bar access to the Service
        immediately, without prior notice or liability, under our sole
        discretion, for any reason whatsoever and without limitation, including
        but not to a breach of the Terms.
      </CustomText>
      <CustomText {...paragraphProps}>
        If you wish to terminate your account, you may simply discontinue using
        the Service and can request the deletion of your account through the
        app's profile settings. All provisions of the Terms which by their
        nature should survive termination shall survive termination, including,
        without limitation, ownership provisions, warranty disclaimers,
        indemnity, and limitations of liability.
      </CustomText>

      <CustomText variant="titleMedium" bold>
        15. Changes to Terms and Services
      </CustomText>

      <CustomText {...paragraphProps}>
        We may modify these Terms at any time. We will provide notice of such
        changes, for example, by sending an email, providing a notice through
        the App, or updating the "Last updated" date at the top of these Terms.
        By continuing to use the App, you confirm your acceptance of the revised
        Terms. We encourage you to review the Terms from time to time to ensure
        you understand the terms and conditions that apply to your use of the
        Services.
      </CustomText>

      <CustomText {...paragraphProps}>
        Furthermore, we reserve the right to modify, suspend, or discontinue,
        temporarily or permanently, the Services (or any features or parts
        thereof) with or without notice. You agree that we will not be liable
        for any modification, suspension, or discontinuance of the Services or
        any part thereof.
      </CustomText>

      <CustomText variant="titleMedium" bold>
        16. Governing Law and Dispute Resolution
      </CustomText>

      <CustomText {...paragraphProps}>
        These Terms are governed by the laws of Lithuania.
      </CustomText>
      <CustomText {...paragraphProps}>
        Any dispute arising out of or in connection with these Terms, including
        any question regarding its existence, validity, or termination, shall be
        referred to and finally resolved by binding arbitration under the laws
        of Lithuania. You agree that any dispute resolution proceedings will be
        conducted only on an individual basis and not in a class, consolidated,
        or representative action. By entering into these Terms, you and
        Lithuaningo are each waiving the right to a trial by jury or to
        participate in a class action.
      </CustomText>

      <CustomText variant="titleMedium" bold>
        17. Contact Us
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
