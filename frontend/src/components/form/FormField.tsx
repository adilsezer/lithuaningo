import React, { forwardRef } from 'react';
import { FormField as FormFieldType } from './form.types';
import CustomSwitch from '@components/ui/CustomSwitch';
import CustomTextInput from '@components/ui/CustomTextInput';
import CustomText from '@components/ui/CustomText';
import { TextInput } from 'react-native';

interface FormFieldProps {
  field: FormFieldType;
  onChange: (value: string | boolean) => void;
  onBlur: () => void;
  value: string | boolean;
  error?: string;
}

export const FormField = forwardRef<TextInput, FormFieldProps>(
  ({ field, onChange, onBlur, value, error }, ref) => {
    const { label, category, type, defaultValue, ...inputProps } = field;
    const props = {
      label,
      error,
      onBlur,
      ...inputProps,
    };

    switch (category) {
      case 'text-input':
        return (
          <CustomTextInput
            {...props}
            ref={ref}
            value={typeof value === 'string' ? value : ''}
            onChangeText={(text: string) => onChange(text)}
            secureTextEntry={type === 'password'}
            keyboardType={type === 'email' ? 'email-address' : 'default'}
            autoCapitalize={field.autoCapitalize || 'none'}
          />
        );

      case 'toggle':
        return (
          <CustomSwitch
            {...props}
            value={typeof value === 'boolean' ? value : false}
            onValueChange={(newValue: boolean) => onChange(newValue)}
          />
        );

      case 'link':
        return (
          <CustomText
            style={{ textDecorationLine: 'underline' }}
            onPress={field.onPress}
          >
            {field.linkText || field.label}
          </CustomText>
        );

      default:
        return null;
    }
  }
);

FormField.displayName = 'FormField';
