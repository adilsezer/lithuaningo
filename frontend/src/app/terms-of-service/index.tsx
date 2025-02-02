import React from "react";
import { ScrollView, StyleProp, StyleSheet, TextStyle } from "react-native";
import BackButton from "@components/layout/BackButton";
import * as Linking from "expo-linking";
import CustomText from "@components/ui/CustomText";

// Define a local union type for the variants used in this file.
type ValidVariant = "titleLarge" | "titleMedium" | "bodyMedium";

// Define a helper type for the paragraph props.
interface ParagraphProps {
  variant: ValidVariant;
  style: StyleProp<TextStyle>;
}

const TermsOfService = () => {
  // Create a helper object for body text props.
  const paragraphProps: ParagraphProps = {
    variant: "bodyMedium",
    style: styles.justifiedText,
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton />

      {/* Heading */}
      <CustomText variant="titleLarge" bold>
        Terms of Service
      </CustomText>

      {/* Paragraphs */}
      <CustomText {...paragraphProps}>Last updated: June 10, 2024</CustomText>

      <CustomText variant="titleMedium" bold>
        1. Content Creation and Ownership
      </CustomText>
      <CustomText {...paragraphProps}>
        When creating content on Lithuaningo (including but not limited to
        decks, flashcards, comments, and translations), you:
      </CustomText>
      <CustomText {...paragraphProps}>
        • Retain ownership of your original content while granting us a
        worldwide, non-exclusive, royalty-free license to use, modify, and
        distribute it
      </CustomText>
      <CustomText {...paragraphProps}>
        • Warrant that you have all necessary rights to share the content
      </CustomText>
      <CustomText {...paragraphProps}>
        • Accept that we may use your content for improving our services,
        including AI training
      </CustomText>

      <CustomText variant="titleMedium" bold>
        2. Content Guidelines
      </CustomText>
      <CustomText {...paragraphProps}>
        You agree not to create or share content that:
      </CustomText>
      <CustomText {...paragraphProps}>
        • Infringes on intellectual property rights
      </CustomText>
      <CustomText {...paragraphProps}>
        • Contains hate speech or discriminatory content
      </CustomText>
      <CustomText {...paragraphProps}>
        • Includes inappropriate or adult content
      </CustomText>
      <CustomText {...paragraphProps}>
        • Promotes illegal activities or violence
      </CustomText>
      <CustomText {...paragraphProps}>
        • Contains malware or harmful code
      </CustomText>
      <CustomText {...paragraphProps}>
        • Deliberately provides incorrect translations
      </CustomText>

      <CustomText variant="titleMedium" bold>
        3. Public Content and Sharing
      </CustomText>
      <CustomText {...paragraphProps}>
        By using Lithuaningo, you acknowledge that:
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
        4. Content Moderation
      </CustomText>
      <CustomText {...paragraphProps}>We reserve the right to:</CustomText>
      <CustomText {...paragraphProps}>
        • Review, modify, or remove any content without notice
      </CustomText>
      <CustomText {...paragraphProps}>
        • Suspend or terminate accounts violating these terms
      </CustomText>
      <CustomText {...paragraphProps}>
        • Share content with law enforcement if legally required
      </CustomText>
      <CustomText {...paragraphProps}>
        • Use automated systems for content moderation
      </CustomText>

      <CustomText variant="titleMedium" bold>
        5. Intellectual Property
      </CustomText>
      <CustomText {...paragraphProps}>
        • The Lithuaningo app, brand, and original content are protected by
        intellectual property laws
      </CustomText>
      <CustomText {...paragraphProps}>
        • User-generated content remains the property of its creators, subject
        to our license terms
      </CustomText>
      <CustomText {...paragraphProps}>
        • Users must respect third-party intellectual property rights
      </CustomText>

      <CustomText variant="titleMedium" bold>
        6. Limitation of Liability
      </CustomText>
      <CustomText {...paragraphProps}>
        • We provide the service "as is" without warranties of any kind
      </CustomText>
      <CustomText {...paragraphProps}>
        • We are not responsible for the accuracy of user-generated translations
        or content
      </CustomText>
      <CustomText {...paragraphProps}>
        • We are not liable for any damages arising from using our service
      </CustomText>
      <CustomText {...paragraphProps}>
        • Our liability is limited to the amount paid for our services, where
        applicable
      </CustomText>

      <CustomText variant="titleMedium" bold>
        7. Indemnification
      </CustomText>
      <CustomText {...paragraphProps}>
        You agree to indemnify and hold harmless Lithuaningo, its owners,
        employees, and affiliates from any claims, damages, or expenses
        (including legal fees) arising from:
      </CustomText>
      <CustomText {...paragraphProps}>• Your use of the service</CustomText>
      <CustomText {...paragraphProps}>• Your content submissions</CustomText>
      <CustomText {...paragraphProps}>
        • Your violation of these terms
      </CustomText>
      <CustomText {...paragraphProps}>
        • Your violation of any rights of another party
      </CustomText>

      <CustomText variant="titleMedium" bold>
        8. Content Reporting
      </CustomText>
      <CustomText {...paragraphProps}>
        • Users can report inappropriate content through our reporting system
      </CustomText>
      <CustomText {...paragraphProps}>
        • We will investigate reports and take appropriate action
      </CustomText>
      <CustomText {...paragraphProps}>
        • False reporting may result in account suspension
      </CustomText>

      <CustomText variant="titleMedium" bold>
        9. Data Usage and Privacy
      </CustomText>
      <CustomText {...paragraphProps}>
        • We collect and use data as described in our Privacy Policy
      </CustomText>
      <CustomText {...paragraphProps}>
        • User content may be analyzed to improve our services
      </CustomText>
      <CustomText {...paragraphProps}>
        • We may share anonymized data with third parties
      </CustomText>

      <CustomText variant="titleMedium" bold>
        10. Changes to Terms
      </CustomText>
      <CustomText {...paragraphProps}>
        • We may modify these terms at any time with notice
      </CustomText>
      <CustomText {...paragraphProps}>
        • Continued use after changes constitutes acceptance
      </CustomText>

      <CustomText variant="titleMedium" bold>
        11. Governing Law
      </CustomText>
      <CustomText {...paragraphProps}>
        These Terms are governed by the laws of Lithuania. Any disputes will be
        subject to the exclusive jurisdiction of the courts of Lithuania.
      </CustomText>

      <CustomText variant="titleMedium" bold>
        12. Contact Us
      </CustomText>
      <CustomText {...paragraphProps}>
        For questions about these terms, please contact us:
      </CustomText>
      <CustomText {...paragraphProps}>
        By email:{" "}
        <CustomText
          style={[paragraphProps.style, styles.link]}
          onPress={() => Linking.openURL("mailto:lithuaningo@gmail.com")}
        >
          lithuaningo@gmail.com
        </CustomText>
      </CustomText>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  justifiedText: {
    textAlign: "justify",
  },
  link: {
    color: "#0000FF",
    textDecorationLine: "underline",
  },
});

export default TermsOfService;
