import BackButton from "@components/BackButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import React from "react";
import { View, Text, StyleSheet, ScrollView, Linking } from "react-native";

const PrivacyPolicy = () => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  return (
    <ScrollView>
      <BackButton />
      <Text style={globalStyles.title}>Privacy Policy</Text>
      <Text style={globalStyles.subtitle}>Last updated: June 10, 2024</Text>
      <Text style={globalStyles.paragraph}>
        Thank you for choosing Lithuaningo ("us", "we", or "our"). This Privacy
        Policy explains how we collect, use, and disclose information about you
        when you use our mobile application ("App").
      </Text>
      <Text style={globalStyles.paragraph}>
        By using the App, you agree to the collection and use of information in
        accordance with this Privacy Policy.
      </Text>

      <Text style={globalStyles.subtitle}>1. Information We Collect</Text>
      <Text style={globalStyles.paragraph}>
        We collect the following types of information:
      </Text>
      <Text style={globalStyles.paragraph}>
        - <Text style={globalStyles.text}>Personal Information</Text>: When you
        register for an account, we may collect personal information such as
        your name, email address, and profile picture.
      </Text>
      <Text style={globalStyles.paragraph}>
        - <Text style={globalStyles.text}>Usage Data</Text>: We collect
        information on how you access and use the App. This includes information
        such as your device's IP address, browser type, browser version, the
        pages of our App that you visit, the time and date of your visit, the
        time spent on those pages, and other diagnostic data.
      </Text>
      <Text style={globalStyles.paragraph}>
        - <Text style={globalStyles.text}>Customer Support Data</Text>: Data
        generated during a customer support request.
      </Text>
      <Text style={globalStyles.paragraph}>
        - <Text style={globalStyles.text}>Other User Content</Text>:
        User-generated content such as quiz answers and interactions.
      </Text>
      <Text style={globalStyles.paragraph}>
        - <Text style={globalStyles.text}>Product Interaction Data</Text>:
        Information about how you interact with our App, including app launches,
        taps, clicks, scrolling information, quiz interactions, and study
        sessions.
      </Text>
      <Text style={globalStyles.paragraph}>
        - <Text style={globalStyles.text}>Crash Data</Text>: Logs of crashes,
        errors, or exceptions that occur within the app.
      </Text>
      <Text style={globalStyles.paragraph}>
        - <Text style={globalStyles.text}>Performance Data</Text>: Information
        on app launch times, hang rates, energy usage, and other metrics related
        to the performance of the app.
      </Text>
      <Text style={globalStyles.paragraph}>
        - <Text style={globalStyles.text}>Other Diagnostic Data</Text>:
        Additional technical diagnostics related to the app.
      </Text>

      <Text style={globalStyles.subtitle}>2. How We Use Your Information</Text>
      <Text style={globalStyles.paragraph}>
        We use the collected information for various purposes:
      </Text>
      <Text style={globalStyles.paragraph}>
        - To provide and maintain our App
      </Text>
      <Text style={globalStyles.paragraph}>
        - To notify you about changes to our App
      </Text>
      <Text style={globalStyles.paragraph}>
        - To allow you to participate in interactive features of our App when
        you choose to do so
      </Text>
      <Text style={globalStyles.paragraph}>- To provide customer support</Text>
      <Text style={globalStyles.paragraph}>
        - To gather analysis or valuable information so that we can improve our
        App
      </Text>
      <Text style={globalStyles.paragraph}>
        - To monitor the usage of our App
      </Text>
      <Text style={globalStyles.paragraph}>
        - To detect, prevent, and address technical issues
      </Text>

      <Text style={globalStyles.subtitle}>3. Sharing of Your Information</Text>
      <Text style={globalStyles.paragraph}>
        We do not share your personal information with third parties except in
        the following circumstances:
      </Text>
      <Text style={globalStyles.paragraph}>- With your consent</Text>
      <Text style={globalStyles.paragraph}>
        - To comply with a legal obligation
      </Text>
      <Text style={globalStyles.paragraph}>
        - To protect and defend our rights or property
      </Text>
      <Text style={globalStyles.paragraph}>
        - To prevent or investigate possible wrongdoing in connection with the
        App
      </Text>
      <Text style={globalStyles.paragraph}>
        - To protect the personal safety of users of the App or the public
      </Text>

      <Text style={globalStyles.subtitle}>4. Third-Party Content</Text>
      <Text style={globalStyles.paragraph}>
        Our App may contain, show, or access content created by third parties,
        including AI-generated images provided by external services. We ensure
        that we have the necessary rights to use this third-party content.
        However, we are not responsible for the privacy practices or the content
        of these third-party providers. We strongly advise you to review the
        privacy policies of any third-party services you use through our App.
      </Text>

      <Text style={globalStyles.subtitle}>5. Security of Your Information</Text>
      <Text style={globalStyles.paragraph}>
        The security of your personal information is important to us. We strive
        to use commercially acceptable means to protect your personal
        information, but remember that no method of transmission over the
        Internet or method of electronic storage is 100% secure.
      </Text>

      <Text style={globalStyles.subtitle}>6. Links to Other Sites</Text>
      <Text style={globalStyles.paragraph}>
        Our App may contain links to other sites that are not operated by us. If
        you click on a third-party link, you will be directed to that third
        party's site. We strongly advise you to review the Privacy Policy of
        every site you visit.
      </Text>

      <Text style={globalStyles.subtitle}>7. Children's Privacy</Text>
      <Text style={globalStyles.paragraph}>
        Our App is suitable for ages 4 and up. We do not knowingly collect
        personally identifiable information from children under 13. If you are a
        parent or guardian and you are aware that your child has provided us
        with personal information, please contact us.
      </Text>

      <Text style={globalStyles.subtitle}>
        8. Changes to This Privacy Policy
      </Text>
      <Text style={globalStyles.paragraph}>
        We may update our Privacy Policy from time to time. We will notify you
        of any changes by posting the new Privacy Policy on this page. You are
        advised to review this Privacy Policy periodically for any changes.
      </Text>

      <Text style={globalStyles.subtitle}>9. Contact Us</Text>
      <Text style={globalStyles.paragraph}>
        If you have any questions about this Privacy Policy, please contact us:
      </Text>
      <Text style={globalStyles.paragraph}>
        - By email:{" "}
        <Text
          style={{ color: globalColors.link }}
          onPress={() => Linking.openURL("mailto:lithuaningo@gmail.com")}
        >
          lithuaningo@gmail.com
        </Text>
      </Text>
      <Text style={globalStyles.paragraph}>
        - By visiting this page on our website:{" "}
        <Text
          style={{ color: globalColors.link }}
          onPress={() =>
            Linking.openURL(
              "https://adilsezer.github.io/lithuaningo/privacy-policy"
            )
          }
        >
          Privacy Policy URL
        </Text>
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});

export default PrivacyPolicy;
