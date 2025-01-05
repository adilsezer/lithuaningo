import React, { useEffect } from "react";
import { Platform, ScrollView } from "react-native";
import Divider from "@components/ui/Divider";
import CustomButton from "@components/ui/CustomButton";
import { useAuth } from "@hooks/useAuth";
import BackButton from "@components/layout/BackButton";
import { useAppSelector } from "@redux/hooks";
import { selectIsLoading } from "@redux/slices/uiSlice";
import AppleSignInButton from "@components/auth/AppleSignInButton";
import crashlytics from "@react-native-firebase/crashlytics";
import { SectionTitle } from "@components/typography";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { Form } from "@components/form/Form";
import { FORM_RULES } from "@utils/formValidation";
import type { FormField } from "@components/form/form.types";

const signupFields: FormField[] = [
  {
    name: "displayName",
    label: "Name",
    type: "text",
    rules: FORM_RULES.name,
  },
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
    rules: FORM_RULES.password,
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    type: "password",
    rules: {
      required: "Please confirm your password",
      validate: (value, formValues) =>
        value === formValues.password || "Passwords don't match",
    },
  },
];

const SignUpScreen: React.FC = () => {
  const loading = useAppSelector(selectIsLoading);
  const { colors } = useThemeStyles();
  const { signUp, signInWithSocial } = useAuth();

  useEffect(() => {
    crashlytics().log("Sign up screen loaded.");
  }, []);

  return (
    <ScrollView>
      <BackButton />
      <SectionTitle>Create Account</SectionTitle>

      <Form
        fields={signupFields}
        onSubmit={async (data) => {
          await signUp(data.email, data.password, data.displayName);
        }}
        submitButtonText="Sign Up"
        isLoading={loading}
        options={{ mode: "onBlur" }}
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
