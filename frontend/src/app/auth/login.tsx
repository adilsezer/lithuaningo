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
import { Form } from "@components/form/Form";
import type { FormField } from "@components/form/form.types";
import { FORM_RULES } from "@utils/formValidation";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useNavigation } from "@react-navigation/native";

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
  const { colors } = useThemeStyles();
  const { signIn, signInWithSocial } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    crashlytics().log("Login screen loaded.");
  }, []);

  return (
    <ScrollView>
      <BackButton />
      <SectionTitle>Welcome Back</SectionTitle>

      <Form
        fields={loginFields}
        onSubmit={async (data) => {
          await signIn(data.email, data.password);
        }}
        submitButtonText="Sign In"
        isLoading={loading}
        options={{ mode: "onBlur" }}
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
