import React, { useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import BackButton from "@components/layout/BackButton";
import { Form } from "@components/form/Form";
import type { FormField } from "@components/form/form.types";
import { useAuth } from "@hooks/useAuth";
import { useIsLoading } from "@stores/useUIStore";
import { verifyEmailFormSchema } from "@utils/zodSchemas";
import CustomText from "@components/ui/CustomText";
import CustomButton from "@components/ui/CustomButton";
import { useLocalSearchParams } from "expo-router";

const verifyEmailFields: FormField[] = [
  {
    name: "token",
    label: "Verification Code",
    category: "text-input",
    type: "text",
    placeholder: "Enter the 6-digit code",
    keyboardType: "number-pad",
    maxLength: 6,
  },
];

const VerifyEmailScreen: React.FC = () => {
  const loading = useIsLoading();
  const { verifyEmail, resendVerificationCode } = useAuth();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleResend = async () => {
    const success = await resendVerificationCode(email as string);
    if (success) {
      setResendDisabled(true);
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  return (
    <ScrollView>
      <BackButton />
      <View style={styles.container}>
        <CustomText variant="titleLarge" bold>
          Verify Your Email
        </CustomText>

        <CustomText variant="bodyLarge" style={styles.description}>
          We've sent a verification code to {email}. Please enter the code below
          to verify your email address.
        </CustomText>

        <Form
          fields={verifyEmailFields}
          onSubmit={async (data) => {
            await verifyEmail(email as string, data.token);
          }}
          submitButtonText="Verify Email"
          isLoading={loading}
          options={{ mode: "onBlur" }}
          zodSchema={verifyEmailFormSchema}
        />

        <View style={styles.resendContainer}>
          <CustomButton
            onPress={handleResend}
            title={
              resendDisabled ? `Resend code in ${countdown}s` : "Resend code"
            }
            disabled={resendDisabled}
            mode="text"
          />
        </View>

        <CustomText variant="bodyMedium" style={styles.note}>
          Didn't receive the code? Check your spam folder or contact support.
        </CustomText>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  description: {
    marginTop: 8,
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  note: {
    marginTop: 16,
    textAlign: "center",
  },
});

export default VerifyEmailScreen;
