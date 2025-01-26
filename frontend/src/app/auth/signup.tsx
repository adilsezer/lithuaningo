import React, { useEffect } from "react";
import { Platform, ScrollView } from "react-native";
import Divider from "@components/ui/Divider";
import CustomButton from "@components/ui/CustomButton";
import BackButton from "@components/layout/BackButton";
import AppleSignInButton from "@components/auth/AppleSignInButton";
import { SectionTitle } from "@components/typography";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { Form } from "@components/form/Form";
import type { FormField } from "@components/form/form.types";
import { useAuth } from "@hooks/useAuth";
import { useIsLoading } from "@stores/useUIStore";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import crashlytics from "@react-native-firebase/crashlytics";
import { signupFormSchema } from "@utils/zodSchemas";

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
  const { colors } = useThemeStyles();
  const loading = useIsLoading();
  const { signUp, signInWithSocial, error, clearError } = useAuth();

  useEffect(() => {
    crashlytics().log("Sign up screen loaded.");
  }, []);

  return (
    <ScrollView>
      <BackButton />
      <SectionTitle>Create Account</SectionTitle>

      {error && <ErrorMessage message={error} onRetry={clearError} />}

      <Form
        fields={signupFields}
        onSubmit={async (data) => {
          await signUp(data.email, data.password, data.displayName);
        }}
        submitButtonText="Sign Up"
        isLoading={loading}
        options={{ mode: "onBlur" }}
        zodSchema={signupFormSchema}
      />

      <Divider content="Or" />

      <CustomButton
        onPress={() => signInWithSocial("google")}
        title="Continue with Google"
        icon={require("assets/images/google-logo.png")}
        style={{ backgroundColor: colors.card, paddingVertical: 18 }}
        textStyle={{ color: colors.cardText }}
        disabled={loading}
      />

      {Platform.OS === "ios" && (
        <AppleSignInButton
          onPress={() => signInWithSocial("apple")}
          disabled={loading}
        />
      )}
    </ScrollView>
  );
};

export default SignUpScreen;
