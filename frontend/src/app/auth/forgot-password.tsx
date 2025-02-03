import React, { useEffect } from "react";
import { ScrollView, View } from "react-native";
import BackButton from "@components/layout/BackButton";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";
import { useAuth } from "@hooks/useAuth";
import { useIsLoading } from "@stores/useUIStore";
import { forgotPasswordFormSchema } from "@utils/zodSchemas";
import CustomText from "@components/ui/CustomText";

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
  const isLoading = useIsLoading();
  const { resetPassword } = useAuth();

  return (
    <ScrollView>
      <BackButton />

      <View>
        <CustomText variant="titleLarge" bold>
          Reset Password
        </CustomText>
        <CustomText>
          Enter your email and we will send you a link to reset your password.
        </CustomText>
      </View>

      <Form
        fields={forgotPasswordFields}
        onSubmit={async (data) => {
          await resetPassword(data.email);
        }}
        submitButtonText="Reset Password"
        isLoading={isLoading}
        options={{ mode: "onBlur" }}
        zodSchema={forgotPasswordFormSchema}
      />
    </ScrollView>
  );
};

export default ForgotPasswordScreen;
