import React from "react";
import { ScrollView } from "react-native";
import BackButton from "@components/layout/BackButton";
import * as Linking from "expo-linking";
import CustomText from "@components/ui/CustomText";
import { LinkText } from "@components/typography/LinkText";
import { Paragraph } from "react-native-paper";

const TermsOfService = () => {
  return (
    <ScrollView>
      <BackButton />
      <CustomText>Terms of Service</CustomText>
      <CustomText>Last updated: June 10, 2024</CustomText>

      <CustomText>1. Content Creation and Ownership</CustomText>
      <CustomText>
        When creating content on Lithuaningo (including but not limited to
        decks, flashcards, comments, and translations), you:
      </CustomText>
      <CustomText>
        • Retain ownership of your original content while granting us a
        worldwide, non-exclusive, royalty-free license to use, modify, and
        distribute it
      </CustomText>
      <CustomText>
        • Warrant that you have all necessary rights to share the content
      </CustomText>
      <CustomText>
        • Accept that we may use your content for improving our services,
        including AI training
      </CustomText>

      <CustomText>2. Content Guidelines</CustomText>
      <CustomText>You agree not to create or share content that:</CustomText>
      <CustomText>• Infringes on intellectual property rights</CustomText>
      <CustomText>• Contains hate speech or discriminatory content</CustomText>
      <CustomText>• Includes inappropriate or adult content</CustomText>
      <CustomText>• Promotes illegal activities or violence</CustomText>
      <CustomText>• Contains malware or harmful code</CustomText>
      <CustomText>• Deliberately provides incorrect translations</CustomText>

      <CustomText>3. Public Content and Sharing</CustomText>
      <CustomText>By using Lithuaningo, you acknowledge that:</CustomText>
      <CustomText>
        • All user-created content is public and visible to other users
      </CustomText>
      <CustomText>
        • Your username will be displayed alongside your content
      </CustomText>
      <CustomText>• Other users can use and learn from your content</CustomText>
      <CustomText>
        • We may feature your content in promotional materials
      </CustomText>

      <CustomText>4. Content Moderation</CustomText>
      <CustomText>We reserve the right to:</CustomText>
      <CustomText>
        • Review, modify, or remove any content without notice
      </CustomText>
      <CustomText>
        • Suspend or terminate accounts violating these terms
      </CustomText>
      <CustomText>
        • Share content with law enforcement if legally required
      </CustomText>
      <CustomText>• Use automated systems for content moderation</CustomText>

      <CustomText>5. Intellectual Property</CustomText>
      <CustomText>
        • The Lithuaningo app, brand, and original content are protected by
        intellectual property laws
      </CustomText>
      <CustomText>
        • User-generated content remains the property of its creators, subject
        to our license terms
      </CustomText>
      <CustomText>
        • Users must respect third-party intellectual property rights
      </CustomText>

      <CustomText>6. Limitation of Liability</CustomText>
      <CustomText>
        • We provide the service "as is" without warranties of any kind
      </CustomText>
      <CustomText>
        • We are not responsible for the accuracy of user-generated translations
        or content
      </CustomText>
      <CustomText>
        • We are not liable for any damages arising from using our service
      </CustomText>
      <CustomText>
        • Our liability is limited to the amount paid for our services, where
        applicable
      </CustomText>

      <CustomText>7. Indemnification</CustomText>
      <CustomText>
        You agree to indemnify and hold harmless Lithuaningo, its owners,
        employees, and affiliates from any claims, damages, or expenses
        (including legal fees) arising from:
      </CustomText>
      <CustomText>• Your use of the service</CustomText>
      <CustomText>• Your content submissions</CustomText>
      <CustomText>• Your violation of these terms</CustomText>
      <CustomText>• Your violation of any rights of another party</CustomText>

      <CustomText>8. Content Reporting</CustomText>
      <CustomText>
        • Users can report inappropriate content through our reporting system
      </CustomText>
      <CustomText>
        • We will investigate reports and take appropriate action
      </CustomText>
      <CustomText>
        • False reporting may result in account suspension
      </CustomText>

      <CustomText>9. Data Usage and Privacy</CustomText>
      <CustomText>
        • We collect and use data as described in our Privacy Policy
      </CustomText>
      <CustomText>
        • User content may be analyzed to improve our services
      </CustomText>
      <CustomText>• We may share anonymized data with third parties</CustomText>

      <CustomText>10. Changes to Terms</CustomText>
      <CustomText>
        • We may modify these terms at any time with notice
      </CustomText>
      <CustomText>
        • Continued use after changes constitutes acceptance
      </CustomText>

      <CustomText>11. Governing Law</CustomText>
      <CustomText>
        These Terms are governed by the laws of Lithuania. Any disputes will be
        subject to the exclusive jurisdiction of the courts of Lithuania.
      </CustomText>

      <CustomText>12. Contact Us</CustomText>
      <CustomText>
        For questions about these terms, please contact us:
      </CustomText>
      <CustomText>
        By email:{" "}
        <LinkText
          onPress={() => Linking.openURL("mailto:lithuaningo@gmail.com")}
        >
          lithuaningo@gmail.com
        </LinkText>
      </CustomText>
    </ScrollView>
  );
};

export default TermsOfService;
