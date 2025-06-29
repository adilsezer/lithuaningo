import React, { useCallback } from "react";
import { ScrollView } from "react-native";
import { useAuth, type SocialProvider } from "@hooks/useAuth";
import { useIsLoading } from "@stores/useUIStore";
import { SocialAuthButtons } from "@components/auth/SocialAuthButtons";
import CustomDivider from "@components/ui/CustomDivider";
import { Form } from "@components/form/Form";
import type { FormField } from "@components/form/form.types";
import { loginFormSchema } from "@utils/zodSchemas";
import CustomText from "@components/ui/CustomText";
import { router } from "expo-router";

const loginFields: FormField[] = [
  {
    name: "email",
    label: "Email",
    category: "text-input",
    type: "email",
    placeholder: "Email",
  },
  {
    name: "password",
    label: "Password",
    category: "text-input",
    type: "password",
    placeholder: "Password",
  },
];

const LoginScreen: React.FC = () => {
  const loading = useIsLoading();
  const { signIn, signInWithSocial } = useAuth();

  const handleSocialAuth = useCallback(
    (provider: SocialProvider) => {
      signInWithSocial(provider);
    },
    [signInWithSocial]
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Form
        fields={loginFields}
        onSubmit={async (data) => {
          await signIn(data.email, data.password);
        }}
        submitButtonText="Sign In"
        isLoading={loading}
        options={{ mode: "onBlur" }}
        zodSchema={loginFormSchema}
      />

      <CustomText
        variant="bodyMedium"
        onPress={() => {
          router.push("/auth/forgot-password");
        }}
        style={{ textDecorationLine: "underline" }}
      >
        Forgot Password?
      </CustomText>

      <CustomDivider content="Or" />

      <SocialAuthButtons
        onGooglePress={() => handleSocialAuth("google")}
        onApplePress={() => handleSocialAuth("apple")}
        mode="login"
      />

      <CustomText
        variant="bodyMedium"
        onPress={() => {
          router.push("/auth/signup");
        }}
        style={{ textDecorationLine: "underline" }}
      >
        Don't have an account? Sign Up
      </CustomText>
    </ScrollView>
  );
};

export default LoginScreen;
