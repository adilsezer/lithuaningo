import React, { useEffect } from "react";
import { ScrollView } from "react-native";
import { useAuth } from "@hooks/useAuth";
import { useAppSelector } from "@redux/hooks";
import { selectIsLoading } from "@redux/slices/uiSlice";
import BackButton from "@components/layout/BackButton";
import crashlytics from "@react-native-firebase/crashlytics";
import { SectionTitle, Instruction } from "@components/typography";
import { Form, FormField } from "@components/forms/Form";
import { FORM_RULES } from "@utils/formValidation";

const forgotPasswordFields: FormField[] = [
  {
    name: "email",
    label: "Email",
    type: "email",
    rules: FORM_RULES.email,
  },
];

const ForgotPasswordScreen: React.FC = () => {
  const loading = useAppSelector(selectIsLoading);
  const { resetPassword } = useAuth();

  useEffect(() => {
    crashlytics().log("Forgot password screen loaded.");
  }, []);

  return (
    <ScrollView>
      <BackButton />
      <SectionTitle>Reset Password</SectionTitle>
      <Instruction>
        Enter your email and we will send you a link to reset your password.
      </Instruction>

      <Form
        fields={forgotPasswordFields}
        onSubmit={({ email }) => resetPassword(email)}
        submitButtonText="Send Reset Link"
        isLoading={loading}
        mode="onBlur"
      />
    </ScrollView>
  );
};

export default ForgotPasswordScreen;
