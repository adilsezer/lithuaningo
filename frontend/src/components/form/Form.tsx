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

const getDefaultValueByType = (field: FormFieldType): any => {
  switch (field.type) {
    case "switch":
    case "checkbox":
      return false;
    case "slider":
      return field.minimumValue || 0;
    case "date":
      return new Date();
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
          [field.name]: field.defaultValue ?? getDefaultValueByType(field),
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
          rules={field.rules}
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
