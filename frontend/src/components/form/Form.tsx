import React from "react";
import { View, StyleSheet } from "react-native";
import {
  useForm,
  Controller,
  FieldValues,
  Path,
  FieldError,
  DefaultValues,
} from "react-hook-form";
import CustomButton from "@components/ui/CustomButton";
import { FormProps, FormField as FormFieldType } from "./form.types";
import { FormField } from "./FormField";

const getDefaultValueByCategory = (field: FormFieldType): any => {
  switch (field.category) {
    case "toggle":
      return false;
    case "range":
      return field.min || 0;
    case "datetime":
      return new Date();
    case "audio-input":
    case "image-input":
      return null;
    default:
      return "";
  }
};

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
  const form = useForm<T>({
    ...options,
    defaultValues: {
      ...fields.reduce(
        (acc, field) => ({
          ...acc,
          [field.name]: field.defaultValue ?? getDefaultValueByCategory(field),
        }),
        {}
      ),
      ...defaultValues,
    } as DefaultValues<T>,
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <View style={style}>
      {fields.map((field) => (
        <Controller
          key={field.name}
          control={control}
          name={field.name as Path<T>}
          rules={field.validation}
          render={({ field: fieldProps }) => (
            <View style={styles.fieldContainer}>
              <FormField
                field={field}
                onChange={fieldProps.onChange}
                onBlur={fieldProps.onBlur}
                value={fieldProps.value}
                error={(errors[field.name as Path<T>] as FieldError)?.message}
              />
            </View>
          )}
        />
      ))}
      <CustomButton
        onPress={handleSubmit(onSubmit)}
        title={isSubmitting ? "Submitting..." : submitButtonText}
        disabled={isLoading || isSubmitting}
        style={[styles.submitButton, submitButtonStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 6,
  },
  submitButton: {
    marginTop: 4,
  },
});
