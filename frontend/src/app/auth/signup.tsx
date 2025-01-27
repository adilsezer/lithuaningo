import React, { useEffect } from "react";
import { Platform, ScrollView } from "react-native";
import CustomButton from "@components/ui/CustomButton";
import BackButton from "@components/layout/BackButton";
import { Form } from "@components/form/Form";
import type { FormField } from "@components/form/form.types";
import { useAuth } from "@hooks/useAuth";
import { useIsLoading } from "@stores/useUIStore";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import crashlytics from "@react-native-firebase/crashlytics";
import { signupFormSchema } from "@utils/zodSchemas";
import CustomText from "@components/ui/CustomText";
import { SocialAuthButtons } from "@components/auth/SocialAuthButtons";
import { router } from "expo-router";
import CustomDivider from "@components/ui/CustomDivider";

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
  const { signUp, signInWithSocial, error, clearError } = useAuth();

  useEffect(() => {
    crashlytics().log("Sign up screen loaded.");
  }, []);

  return (
    <ScrollView>
      <BackButton />
      <CustomText variant="titleLarge" bold>
        Create Account
      </CustomText>

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

      <CustomDivider content="Or" />

      <SocialAuthButtons
        onGooglePress={() => signInWithSocial("google")}
        onApplePress={() => signInWithSocial("apple")}
        disabled={loading}
      />

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

export default SignUpScreen;
