import React from 'react';
import { ScrollView } from 'react-native';
import { Form } from '@components/form/Form';
import { FormField } from '@components/form/form.types';
import { forgotPasswordFormSchema } from '@utils/zodSchemas';
import CustomText from '@components/ui/CustomText';
import { useAlertDialog } from '@hooks/useAlertDialog';
import { useAuth } from '@hooks/useAuth';

const forgotPasswordFields: FormField[] = [
  {
    name: 'email',
    label: 'Email',
    category: 'text-input',
    type: 'email',
    placeholder: 'Enter your email address',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
  },
];

const ForgotPasswordScreen: React.FC = () => {
  const { resetPassword } = useAuth();
  const { showError } = useAlertDialog();

  const handleSubmit = async (data: { email: string }) => {
    const result = await resetPassword(data.email);
    if (!result.success && result.message) {
      showError(result.message);
    }
  };

  return (
    <ScrollView>
      <CustomText>
        Enter your email and we will send you a code to reset your password.
      </CustomText>

      <Form
        fields={forgotPasswordFields}
        onSubmit={handleSubmit}
        submitButtonText='Reset Password'
        options={{ mode: 'onBlur' }}
        zodSchema={forgotPasswordFormSchema}
      />
    </ScrollView>
  );
};

export default ForgotPasswordScreen;
