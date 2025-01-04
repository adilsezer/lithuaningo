import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import CustomTextInput from "@components/ui/CustomTextInput";
import CustomButton from "@components/ui/CustomButton";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useForm, Controller } from "react-hook-form";

export interface FormField {
  name: string;
  label: string;
  type?: "text" | "email" | "password";
  rules?: {
    required?: string | boolean;
    pattern?: {
      value: RegExp;
      message: string;
    };
    minLength?: {
      value: number;
      message: string;
    };
    maxLength?: {
      value: number;
      message: string;
    };
    validate?: (
      value: string,
      formValues: Record<string, string>
    ) => string | boolean | undefined;
  };
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

interface FormProps {
  fields: FormField[];
  onSubmit: (values: Record<string, string>) => any;
  submitButtonText: string;
  isLoading?: boolean;
  defaultValues?: Record<string, string>;
  mode?: "onChange" | "onBlur" | "onSubmit" | "onTouched" | "all";
  style?: ViewStyle;
  submitButtonStyle?: ViewStyle;
}

export const Form: React.FC<FormProps> = ({
  fields,
  onSubmit,
  submitButtonText,
  isLoading = false,
  defaultValues = {},
  mode = "onBlur",
  style,
  submitButtonStyle,
}) => {
  const { colors } = useThemeStyles();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<Record<string, string>>({
    defaultValues,
    mode,
  });

  return (
    <View style={[styles.container, style]}>
      {fields.map((field) => (
        <Controller
          key={field.name}
          control={control}
          name={field.name}
          rules={field.rules}
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomTextInput
              placeholder={field.label}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={field.type === "password"}
              keyboardType={
                field.type === "email" ? "email-address" : "default"
              }
              autoCapitalize={field.autoCapitalize || "none"}
              placeholderTextColor={colors.placeholder}
              error={errors[field.name]?.message}
            />
          )}
        />
      ))}
      <CustomButton
        onPress={handleSubmit(onSubmit)}
        title={isSubmitting ? "Submitting..." : submitButtonText}
        disabled={isLoading || isSubmitting || (!isDirty && !isValid)}
        style={[styles.submitButton, submitButtonStyle]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 16,
  },
  submitButton: {
    marginTop: 16,
  },
});
