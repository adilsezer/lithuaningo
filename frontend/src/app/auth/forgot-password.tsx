import React from "react";
import { ScrollView, View } from "react-native";
import BackButton from "@components/layout/BackButton";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";
import { useForgotPassword } from "@hooks/useForgotPassword";
import { forgotPasswordFormSchema } from "@utils/zodSchemas";
import CustomText from "@components/ui/CustomText";
import { useAlertDialog } from "@hooks/useAlertDialog";
import { router } from "expo-router";

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
  const { showAlert, showError } = useAlertDialog();

  const handleSubmit = async (data: { email: string }) => {
    const result = await handleResetPassword(data.email);

    if (result.success) {
      // Force the alert to be shown in the next tick
      setTimeout(() => {
        showAlert({
          title: "Check Your Email",
          message: "We've sent you a code to reset your password.",
          buttons: [
            {
              text: "OK",
              onPress: () => {
                router.push({
                  pathname: "/auth/password-reset-verification",
                  params: { email: data.email },
                });
              },
            },
          ],
        });
      }, 0);
    } else if (result.message) {
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
