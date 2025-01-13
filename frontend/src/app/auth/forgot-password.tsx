import React, { useEffect } from "react";
import { ScrollView, View } from "react-native";
import BackButton from "@components/layout/BackButton";
import { SectionTitle, Instruction } from "@components/typography";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import { useAuth } from "@hooks/useAuth";
import { useAppSelector } from "@redux/hooks";
import { selectIsLoading } from "@redux/slices/uiSlice";
import { FORM_RULES } from "@utils/formValidation";
import crashlytics from "@react-native-firebase/crashlytics";

type ForgotPasswordData = {
  email: string;
};

const forgotPasswordFields: FormField[] = [
  {
    name: "email",
    label: "Email",
    category: "text-input",
    type: "email",
    placeholder: "Enter your email address",
    keyboardType: "email-address",
    autoCapitalize: "none",
    validation: FORM_RULES.email,
  },
];

const ForgotPasswordScreen: React.FC = () => {
  const isLoading = useAppSelector(selectIsLoading);
  const { resetPassword, error, clearError } = useAuth();

  useEffect(() => {
    crashlytics().log("Forgot password screen loaded.");
  }, []);

  return (
    <ScrollView>
      <BackButton />

      <View>
        <SectionTitle>Reset Password</SectionTitle>
        <Instruction>
          Enter your email and we will send you a link to reset your password.
        </Instruction>
      </View>

      {error && <ErrorMessage message={error} onRetry={clearError} />}

      <Form<ForgotPasswordData>
        fields={forgotPasswordFields}
        onSubmit={async (data) => {
          await resetPassword(data.email);
        }}
        submitButtonText="Reset Password"
        isLoading={isLoading}
        options={{ mode: "onBlur" }}
      />
    </ScrollView>
  );
};

export default ForgotPasswordScreen;
