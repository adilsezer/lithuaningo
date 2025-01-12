import React from "react";
import { ScrollView } from "react-native";
import BackButton from "@components/layout/BackButton";
import {
  SectionTitle,
  Subtitle,
  Paragraph,
  LinkText,
} from "@components/typography";
import * as Linking from "expo-linking";

const TermsOfService = () => {
  return (
    <ScrollView>
      <BackButton />
      <SectionTitle>Terms of Service</SectionTitle>
      <Subtitle>Last updated: June 10, 2024</Subtitle>

      <Subtitle>1. Content Creation and Ownership</Subtitle>
      <Paragraph>
        When creating content on Lithuaningo (including but not limited to
        decks, flashcards, comments, and translations), you:
      </Paragraph>
      <Paragraph>
        • Retain ownership of your original content while granting us a
        worldwide, non-exclusive, royalty-free license to use, modify, and
        distribute it
      </Paragraph>
      <Paragraph>
        • Warrant that you have all necessary rights to share the content
      </Paragraph>
      <Paragraph>
        • Accept that we may use your content for improving our services,
        including AI training
      </Paragraph>

      <Subtitle>2. Content Guidelines</Subtitle>
      <Paragraph>You agree not to create or share content that:</Paragraph>
      <Paragraph>• Infringes on intellectual property rights</Paragraph>
      <Paragraph>• Contains hate speech or discriminatory content</Paragraph>
      <Paragraph>• Includes inappropriate or adult content</Paragraph>
      <Paragraph>• Promotes illegal activities or violence</Paragraph>
      <Paragraph>• Contains malware or harmful code</Paragraph>
      <Paragraph>• Deliberately provides incorrect translations</Paragraph>

      <Subtitle>3. Public Content and Sharing</Subtitle>
      <Paragraph>By using Lithuaningo, you acknowledge that:</Paragraph>
      <Paragraph>
        • All user-created content is public and visible to other users
      </Paragraph>
      <Paragraph>
        • Your username will be displayed alongside your content
      </Paragraph>
      <Paragraph>• Other users can use and learn from your content</Paragraph>
      <Paragraph>
        • We may feature your content in promotional materials
      </Paragraph>

      <Subtitle>4. Content Moderation</Subtitle>
      <Paragraph>We reserve the right to:</Paragraph>
      <Paragraph>
        • Review, modify, or remove any content without notice
      </Paragraph>
      <Paragraph>
        • Suspend or terminate accounts violating these terms
      </Paragraph>
      <Paragraph>
        • Share content with law enforcement if legally required
      </Paragraph>
      <Paragraph>• Use automated systems for content moderation</Paragraph>

      <Subtitle>5. Intellectual Property</Subtitle>
      <Paragraph>
        • The Lithuaningo app, brand, and original content are protected by
        intellectual property laws
      </Paragraph>
      <Paragraph>
        • User-generated content remains the property of its creators, subject
        to our license terms
      </Paragraph>
      <Paragraph>
        • Users must respect third-party intellectual property rights
      </Paragraph>

      <Subtitle>6. Limitation of Liability</Subtitle>
      <Paragraph>
        • We provide the service "as is" without warranties of any kind
      </Paragraph>
      <Paragraph>
        • We are not responsible for the accuracy of user-generated translations
        or content
      </Paragraph>
      <Paragraph>
        • We are not liable for any damages arising from using our service
      </Paragraph>
      <Paragraph>
        • Our liability is limited to the amount paid for our services, where
        applicable
      </Paragraph>

      <Subtitle>7. Indemnification</Subtitle>
      <Paragraph>
        You agree to indemnify and hold harmless Lithuaningo, its owners,
        employees, and affiliates from any claims, damages, or expenses
        (including legal fees) arising from:
      </Paragraph>
      <Paragraph>• Your use of the service</Paragraph>
      <Paragraph>• Your content submissions</Paragraph>
      <Paragraph>• Your violation of these terms</Paragraph>
      <Paragraph>• Your violation of any rights of another party</Paragraph>

      <Subtitle>8. Content Reporting</Subtitle>
      <Paragraph>
        • Users can report inappropriate content through our reporting system
      </Paragraph>
      <Paragraph>
        • We will investigate reports and take appropriate action
      </Paragraph>
      <Paragraph>• False reporting may result in account suspension</Paragraph>

      <Subtitle>9. Data Usage and Privacy</Subtitle>
      <Paragraph>
        • We collect and use data as described in our Privacy Policy
      </Paragraph>
      <Paragraph>
        • User content may be analyzed to improve our services
      </Paragraph>
      <Paragraph>• We may share anonymized data with third parties</Paragraph>

      <Subtitle>10. Changes to Terms</Subtitle>
      <Paragraph>• We may modify these terms at any time with notice</Paragraph>
      <Paragraph>
        • Continued use after changes constitutes acceptance
      </Paragraph>

      <Subtitle>11. Governing Law</Subtitle>
      <Paragraph>
        These Terms are governed by the laws of Lithuania. Any disputes will be
        subject to the exclusive jurisdiction of the courts of Lithuania.
      </Paragraph>

      <Subtitle>12. Contact Us</Subtitle>
      <Paragraph>For questions about these terms, please contact us:</Paragraph>
      <Paragraph>
        By email:{" "}
        <LinkText
          onPress={() => Linking.openURL("mailto:lithuaningo@gmail.com")}
        >
          lithuaningo@gmail.com
        </LinkText>
      </Paragraph>
    </ScrollView>
  );
};

export default TermsOfService;
