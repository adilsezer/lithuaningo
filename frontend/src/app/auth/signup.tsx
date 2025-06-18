import React, { useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { Form } from "@components/form/Form";
import type { FormField } from "@components/form/form.types";
import { useAuth } from "@hooks/useAuth";
import { useIsLoading } from "@stores/useUIStore";
import { signupFormSchemaWithoutLegal } from "@utils/zodSchemas";
import CustomText from "@components/ui/CustomText";
import { SocialAuthButtons } from "@components/auth/SocialAuthButtons";
import { router } from "expo-router";
import CustomDivider from "@components/ui/CustomDivider";
import CustomSwitch from "@components/ui/CustomSwitch";
import { useAlertDialog } from "@hooks/useAlertDialog";

const signupFields: FormField[] = [
  {
    name: "displayName",
    label: "Name",
    category: "text-input",
    type: "text",
    placeholder: "Name",
  },
  {
    name: "email",
    label: "Email",
    category: "text-input",
    type: "email",
    placeholder: "Email",
    keyboardType: "email-address",
    autoCapitalize: "none",
  },
  {
    name: "password",
    label: "Password",
    category: "text-input",
    type: "password",
    placeholder: "Password",
    secureTextEntry: true,
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    category: "text-input",
    type: "password",
    placeholder: "Confirm Password",
    secureTextEntry: true,
  },
];

const SignUpScreen: React.FC = () => {
  const loading = useIsLoading();
  const { signUp, signUpWithSocial } = useAuth();
  const { showAlert } = useAlertDialog();
  const [legalAgreement, setLegalAgreement] = useState(false);

  const handleEmailSignup = async (data: {
    email: string;
    password: string;
    displayName: string;
  }) => {
    if (!legalAgreement) {
      showAlert({
        title: "Legal Agreement Required",
        message:
          "You must confirm you are at least 13 years old and agree to our Terms of Service and Privacy Policy before signing up.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      return;
    }
    await signUp(data.email, data.password, data.displayName);
  };

  const handleSocialSignup = (provider: "google" | "apple") => {
    if (!legalAgreement) {
      showAlert({
        title: "Legal Agreement Required",
        message:
          "You must confirm you are at least 13 years old and agree to our Terms of Service and Privacy Policy before signing up.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      return;
    }
    signUpWithSocial(provider);
  };

  return (
    <ScrollView>
      <Form
        fields={signupFields}
        onSubmit={handleEmailSignup}
        submitButtonText="Sign Up"
        isLoading={loading}
        options={{ mode: "onBlur" }}
        zodSchema={signupFormSchemaWithoutLegal}
      />

      <CustomDivider content="Or sign up with" />

      <SocialAuthButtons
        onGooglePress={() => handleSocialSignup("google")}
        onApplePress={() => handleSocialSignup("apple")}
        mode="signup"
      />

      {/* Universal Legal Agreement - Better positioned */}
      <View style={styles.legalContainer}>
        <CustomSwitch
          value={legalAgreement}
          onValueChange={setLegalAgreement}
          label="I am at least 13 years old and agree to the Terms of Service and Privacy Policy"
          labelStyle={styles.switchLabel}
        />
        <CustomText variant="bodySmall" style={styles.legalLinks}>
          Read our{" "}
          <CustomText
            variant="bodySmall"
            style={{ textDecorationLine: "underline", color: "#0066CC" }}
            onPress={() => router.push("/auth/terms-of-service")}
          >
            Terms of Service
          </CustomText>{" "}
          and{" "}
          <CustomText
            variant="bodySmall"
            style={{ textDecorationLine: "underline", color: "#0066CC" }}
            onPress={() => router.push("/auth/privacy-policy")}
          >
            Privacy Policy
          </CustomText>
        </CustomText>
      </View>

      <CustomText
        variant="bodyMedium"
        onPress={() => {
          router.push("/auth/login");
        }}
        style={{ textDecorationLine: "underline" }}
      >
        Already have an account? Sign In
      </CustomText>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  legalContainer: {
    marginVertical: 16,
    paddingHorizontal: 4,
  },
  switchLabel: {
    fontSize: 14,
    lineHeight: 20,
  },
  legalLinks: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 13,
  },
});

export default SignUpScreen;
