import React, { useState, useEffect } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import BackButton from "@components/ui/BackButton";
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
    placeholder: "Enter the 6-digit code",
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

const PasswordResetVerificationScreen: React.FC = () => {
  const { email } = useLocalSearchParams<{ email: string }>();
  const loading = useIsLoading();
  const { verifyPasswordReset, resetPassword } = useAuth();
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    // Start initial countdown when component mounts
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

    // Cleanup timer on unmount
    return () => clearInterval(timer);
  }, []);

  if (!email) {
    return (
      <ScrollView>
        <BackButton />
        <View style={styles.container}>
          <CustomText variant="titleLarge" bold>
            Error
          </CustomText>
          <CustomText variant="bodyLarge" style={styles.description}>
            Invalid reset password request. Please try again.
          </CustomText>
        </View>
      </ScrollView>
    );
  }

  const handleResend = async () => {
    const response = await resetPassword(email);
    if (response.success) {
      setResendDisabled(true);
      setCountdown(60);
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
          Reset Password
        </CustomText>

        <CustomText variant="bodyLarge" style={styles.description}>
          Enter the verification code sent to {email} and set your new password.
        </CustomText>

        <Form
          fields={resetPasswordVerifyFields}
          onSubmit={async (data) => {
            await verifyPasswordReset(email, data.token, data.newPassword);
          }}
          submitButtonText="Reset Password"
          isLoading={loading}
          options={{ mode: "onBlur" }}
          zodSchema={resetPasswordVerifyFormSchema}
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
          Please check your spam folder if you don't see the code in your inbox.
        </CustomText>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
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

export default PasswordResetVerificationScreen;
