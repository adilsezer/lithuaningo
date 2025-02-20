import React from "react";
import { ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import BackButton from "@components/layout/BackButton";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";
import { useAuth } from "@hooks/useAuth";
import { useIsLoading } from "@stores/useUIStore";
import { resetPasswordVerifyFormSchema } from "@utils/zodSchemas";
import CustomText from "@components/ui/CustomText";
import CustomButton from "@components/ui/CustomButton";

const resetPasswordVerifyFields: FormField[] = [
  {
    name: "token",
    label: "Reset Code",
    category: "text-input",
    type: "text",
    placeholder: "Enter the 6-digit code from your email",
    keyboardType: "number-pad",
    maxLength: 6,
  },
  {
    name: "newPassword",
    label: "New Password",
    category: "text-input",
    type: "password",
    placeholder: "Enter your new password",
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    category: "text-input",
    type: "password",
    placeholder: "Confirm your new password",
  },
];

const ResetPasswordVerifyScreen: React.FC = () => {
  const { email } = useLocalSearchParams<{ email: string }>();
  const isLoading = useIsLoading();
  const { verifyPasswordReset, resetPassword } = useAuth();

  if (!email) {
    return (
      <ScrollView>
        <BackButton />
        <CustomText>Invalid reset password request.</CustomText>
      </ScrollView>
    );
  }

  const handleResendCode = async () => {
    await resetPassword(email);
  };

  return (
    <ScrollView>
      <BackButton />

      <View>
        <CustomText variant="titleLarge" bold>
          Reset Password
        </CustomText>
        <CustomText>
          Enter the verification code sent to your email and your new password.
        </CustomText>
      </View>

      <Form
        fields={resetPasswordVerifyFields}
        onSubmit={async (data) => {
          await verifyPasswordReset(email, data.token, data.newPassword);
        }}
        submitButtonText="Reset Password"
        isLoading={isLoading}
        options={{ mode: "onBlur" }}
        zodSchema={resetPasswordVerifyFormSchema}
      />

      <CustomButton
        mode="text"
        onPress={handleResendCode}
        title="Didn't receive the code? Send again"
        disabled={isLoading}
      />

      <CustomText
        variant="bodySmall"
        style={{ textAlign: "center", marginTop: 16 }}
      >
        Please check your spam folder if you don't see the code in your inbox.
      </CustomText>
    </ScrollView>
  );
};

export default ResetPasswordVerifyScreen;
