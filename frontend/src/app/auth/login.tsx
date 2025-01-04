import React, { useEffect } from "react";
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
import { Form } from "@components/forms/Form";
import { FORM_RULES } from "@utils/formValidation";

const LoginScreen: React.FC = () => {
  const loading = useAppSelector(selectIsLoading);
  const { signIn, signInWithSocial } = useAuth();

  useEffect(() => {
    crashlytics().log("Login screen loaded.");
  }, []);

  return (
    <ScrollView>
      <BackButton />
      <SectionTitle>Welcome Back</SectionTitle>

      <Form<{ email: string; password: string }>
        fields={[
          {
            name: "email",
            label: "Email",
            type: "email",
            rules: FORM_RULES.email,
          },
          {
            name: "password",
            label: "Password",
            type: "password",
            rules: { required: "Password is required" },
          },
        ]}
        onSubmit={async (data) => {
          await signIn(data.email, data.password);
        }}
        submitButtonText="Log In with Email"
        isLoading={loading}
        options={{ mode: "onBlur" }}
        defaultValues={{ email: "", password: "" }}
      />

      <NavigationLink text="Forgot Password?" path="/auth/forgot-password" />

      <Divider content="Or" />

      <SocialAuthButtons
        onGooglePress={() => signInWithSocial("google")}
        onApplePress={() => signInWithSocial("apple")}
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
