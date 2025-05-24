import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Form } from '@components/form/Form';
import { FormField } from '@components/form/form.types';
import { useAuth } from '@hooks/useAuth';
import { useIsLoading } from '@stores/useUIStore';
import { verifyEmailFormSchema } from '@utils/zodSchemas';
import CustomText from '@components/ui/CustomText';
import CustomButton from '@components/ui/CustomButton';

const verifyEmailFields: FormField[] = [
  {
    name: 'token',
    label: 'Verification Code',
    category: 'text-input',
    type: 'text',
    placeholder: 'Enter the 6-digit code',
    keyboardType: 'number-pad',
  },
];

const EmailVerificationScreen: React.FC = () => {
  const { email } = useLocalSearchParams<{ email: string }>();
  const loading = useIsLoading();
  const { verifyEmail, resendVerificationCode } = useAuth();
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
        <View style={styles.container}>
          <CustomText variant="titleMedium" bold>
            Error
          </CustomText>
          <CustomText variant="bodyLarge" style={styles.description}>
            Invalid verification request. Please try again.
          </CustomText>
        </View>
      </ScrollView>
    );
  }

  const handleResend = async () => {
    const success = await resendVerificationCode(email);
    if (success) {
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
      <View style={styles.container}>
        <CustomText variant="titleMedium" bold>
          Verify Your Email
        </CustomText>

        <CustomText variant="bodyLarge" style={styles.description}>
          We've sent a verification code to {email}. Please enter the code below
          to verify your email address.
        </CustomText>

        <Form
          fields={verifyEmailFields}
          onSubmit={async (data) => {
            await verifyEmail(email, data.token);
          }}
          submitButtonText="Verify Email"
          isLoading={loading}
          options={{ mode: 'onBlur' }}
          zodSchema={verifyEmailFormSchema}
        />

        <View style={styles.resendContainer}>
          <CustomButton
            onPress={handleResend}
            title={
              resendDisabled ? `Resend code in ${countdown}s` : 'Resend code'
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
  },
  description: {
    marginTop: 8,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  note: {
    marginTop: 16,
    textAlign: 'center',
  },
});

export default EmailVerificationScreen;
