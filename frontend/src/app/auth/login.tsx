import React, { useEffect, useCallback } from "react";
import { ScrollView } from "react-native";
import { useAuth } from "@hooks/useAuth";
import { useIsLoading } from "@stores/useUIStore";
import NavigationLink from "@components/layout/NavigationLink";
import BackButton from "@components/layout/BackButton";
import { SocialAuthButtons } from "@components/auth/SocialAuthButtons";
import crashlytics from "@react-native-firebase/crashlytics";
import Divider from "@components/ui/Divider";
import { Form } from "@components/form/Form";
import type { FormField } from "@components/form/form.types";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import type { SocialProvider } from "@hooks/useAuth";
import { loginFormSchema } from "@utils/zodSchemas";
import CustomText from "@components/typography/CustomText";

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
  const { signIn, signInWithSocial, error, clearError } = useAuth();

  // Log screen load for analytics
  useEffect(() => {
    crashlytics().log("Login screen loaded.");
  }, []);

  const handleSocialAuth = useCallback(
    (provider: SocialProvider) => {
      signInWithSocial(provider);
    },
    [signInWithSocial]
  );

  return (
    <ScrollView>
      <BackButton />

      <CustomText>Welcome Back</CustomText>

      {error && <ErrorMessage message={error} onRetry={clearError} />}

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
