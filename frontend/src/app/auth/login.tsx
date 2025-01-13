import React, { useEffect, useCallback } from "react";
import { ScrollView } from "react-native";
import { useAuth } from "@hooks/useAuth";
import { useAppSelector } from "@redux/hooks";
import { selectIsLoading } from "@redux/slices/uiSlice";
import NavigationLink from "@components/layout/NavigationLink";
import BackButton from "@components/layout/BackButton";
import { SocialAuthButtons } from "@components/auth/SocialAuthButtons";
import crashlytics from "@react-native-firebase/crashlytics";
import { SectionTitle } from "@components/typography";
import Divider from "@components/ui/Divider";
import { Form } from "@components/form/Form";
import type { FormField } from "@components/form/form.types";
import { FORM_RULES } from "@utils/formValidation";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import type { SocialProvider } from "@hooks/useAuth";

const loginFields: FormField[] = [
  {
    name: "email",
    label: "Email",
    category: "text-input",
    type: "email",
    placeholder: "Email",
    validation: FORM_RULES.email,
  },
  {
    name: "password",
    label: "Password",
    category: "text-input",
    type: "password",
    placeholder: "Password",
    validation: { required: true, message: "Password is required" },
  },
];

const LoginScreen: React.FC = () => {
  const loading = useAppSelector(selectIsLoading);
  const { signIn, signInWithSocial, error, clearError } = useAuth();

  // Log screen load for analytics
  useEffect(() => {
    crashlytics().log("Login screen loaded.");
  }, []);

  // Form submission handler
  const handleSubmit = useCallback(
    async (data: { email: string; password: string }) => {
      await signIn(data.email, data.password);
    },
    [signIn]
  );

  // Social auth handler
  const handleSocialAuth = useCallback(
    (provider: SocialProvider) => {
      signInWithSocial(provider);
    },
    [signInWithSocial]
  );

  return (
    <ScrollView>
      <BackButton />
      <SectionTitle>Welcome Back</SectionTitle>

      {error && <ErrorMessage message={error} onRetry={clearError} />}

      <Form
        fields={loginFields}
        onSubmit={handleSubmit}
        submitButtonText="Sign In"
        isLoading={loading}
        options={{ mode: "onBlur" }}
      />

      <NavigationLink text="Forgot Password?" path="/auth/forgot-password" />

      <Divider content="Or" />

      <SocialAuthButtons
        onGooglePress={() => handleSocialAuth("google")}
        onApplePress={() => handleSocialAuth("apple")}
        disabled={loading}
      />

      <NavigationLink
        text="Don't have an account? Sign Up"
        path="/auth/signup"
      />
    </ScrollView>
  );
};

export default LoginScreen;
