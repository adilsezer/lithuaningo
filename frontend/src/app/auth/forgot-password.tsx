import React from "react";
import { ScrollView, View } from "react-native";
import BackButton from "@components/layout/BackButton";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";
import { useForgotPassword } from "@hooks/useForgotPassword";
import { forgotPasswordFormSchema } from "@utils/zodSchemas";
import CustomText from "@components/ui/CustomText";
import { useAlertDialog } from "@hooks/useAlertDialog";

const forgotPasswordFields: FormField[] = [
  {
    name: "email",
    label: "Email",
    category: "text-input",
    type: "email",
    placeholder: "Enter your email address",
    keyboardType: "email-address",
    autoCapitalize: "none",
  },
];

const ForgotPasswordScreen: React.FC = () => {
  const { isLoading, handleResetPassword } = useForgotPassword();
  const { showError } = useAlertDialog();

  const handleSubmit = async (data: { email: string }) => {
    const result = await handleResetPassword(data.email);
    if (!result.success && result.message) {
      showError(result.message);
    }
  };

  return (
    <ScrollView>
      <BackButton />

      <View>
        <CustomText variant="titleLarge" bold>
          Reset Password
        </CustomText>
        <CustomText>
          Enter your email and we will send you a code to reset your password.
        </CustomText>
      </View>

      <Form
        fields={forgotPasswordFields}
        onSubmit={handleSubmit}
        submitButtonText="Reset Password"
        isLoading={isLoading}
        options={{ mode: "onBlur" }}
        zodSchema={forgotPasswordFormSchema}
      />
    </ScrollView>
  );
};

export default ForgotPasswordScreen;
