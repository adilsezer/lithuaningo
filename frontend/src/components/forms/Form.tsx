import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import {
  useForm,
  Controller,
  FieldValues,
  UseFormProps,
  Path,
  DefaultValues,
} from "react-hook-form";
import { useThemeStyles } from "@hooks/useThemeStyles";
import CustomButton from "@components/ui/CustomButton";
import CustomTextInput from "@components/ui/CustomTextInput";
import {
  CustomPicker,
  CustomSwitch,
  CustomSlider,
  CustomCheckbox,
  CustomDatePicker,
  CustomImagePicker,
} from "@components/ui/form-inputs";

type FieldType =
  | "text"
  | "email"
  | "password"
  | "picker"
  | "switch"
  | "slider"
  | "checkbox"
  | "date"
  | "image";

export type FormField<T> = {
  name: keyof T;
  label: string;
  type: FieldType;
  rules?: {
    required?: string | boolean;
    pattern?: { value: RegExp; message: string };
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    validate?: (value: any, formValues: T) => string | boolean | undefined;
  };
  // Additional props based on type
  options?: Array<{ label: string; value: string }>; // for picker
  minimumValue?: number; // for slider
  maximumValue?: number; // for slider
  step?: number; // for slider
  mode?: "date" | "time"; // for date picker
  minimumDate?: Date; // for date picker
  maximumDate?: Date; // for date picker
  autoCapitalize?: "none" | "sentences" | "words" | "characters"; // for text inputs
};

interface FormProps<T extends FieldValues> {
  fields: FormField<T>[];
  onSubmit: (data: T) => Promise<void> | void;
  submitButtonText: string;
  isLoading?: boolean;
  options?: Omit<UseFormProps<T>, "defaultValues">;
  defaultValues?: DefaultValues<T>;
  style?: ViewStyle;
  submitButtonStyle?: ViewStyle;
}

export function Form<T extends FieldValues>({
  fields,
  onSubmit,
  submitButtonText,
  isLoading = false,
  options,
  defaultValues,
  style,
  submitButtonStyle,
}: FormProps<T>) {
  const { colors } = useThemeStyles();
  const form = useForm<T>({
    ...options,
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = form;

  const renderField = (
    field: FormField<T>,
    { onChange, onBlur, value }: any
  ) => {
    const commonProps = {
      label: field.label,
      error: errors[field.name]?.message as string,
    };

    switch (field.type) {
      case "text":
      case "email":
      case "password":
        return (
          <CustomTextInput
            {...commonProps}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry={field.type === "password"}
            keyboardType={field.type === "email" ? "email-address" : "default"}
            autoCapitalize={field.autoCapitalize || "none"}
            placeholderTextColor={colors.text}
          />
        );

      case "picker":
        return (
          <CustomPicker
            {...commonProps}
            value={value}
            onValueChange={onChange}
            options={field.options || []}
          />
        );

      case "switch":
        return (
          <CustomSwitch
            {...commonProps}
            value={value}
            onValueChange={onChange}
          />
        );

      case "slider":
        return (
          <CustomSlider
            {...commonProps}
            value={value ?? field.minimumValue}
            onValueChange={onChange}
            minimumValue={field.minimumValue || 0}
            maximumValue={field.maximumValue || 100}
            step={field.step}
          />
        );

      case "checkbox":
        return (
          <CustomCheckbox
            {...commonProps}
            value={value}
            onValueChange={onChange}
          />
        );

      case "date":
        return (
          <CustomDatePicker
            {...commonProps}
            value={value ?? new Date()}
            onChange={onChange}
            mode={field.mode}
            minimumDate={field.minimumDate}
            maximumDate={field.maximumDate}
          />
        );

      case "image":
        return (
          <CustomImagePicker
            {...commonProps}
            value={value}
            onChange={onChange}
          />
        );
    }
  };

  return (
    <View style={[styles.container, style]}>
      {fields.map((field) => (
        <Controller
          key={String(field.name)}
          control={control}
          name={field.name as Path<T>}
          rules={field.rules}
          render={({ field: fieldProps }) => (
            <View style={styles.fieldContainer}>
              {renderField(field, fieldProps)}
            </View>
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
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 16,
  },
});
