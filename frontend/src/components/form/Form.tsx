import React from "react";
import { View, StyleSheet } from "react-native";
import {
  useForm,
  Controller,
  FieldValues,
  Path,
  DefaultValues,
  FieldError,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@components/ui/CustomButton";
import { FormProps, FormField as FormFieldType } from "./form.types";
import { FormField } from "./FormField";
import { useAlertDialog } from "@components/ui/AlertDialog";
const getDefaultValueByCategory = (field: FormFieldType): any => {
  switch (field.category) {
    case "toggle":
      return false;
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
  zodSchema,
}: FormProps<T>) {
  const form = useForm<T>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    ...options,
    ...(zodSchema && { resolver: zodResolver(zodSchema) }),
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

  const alertDialog = useAlertDialog();

  const {
    control,
    handleSubmit: formHandleSubmit,
    formState: { errors: formErrors, isSubmitting },
  } = form;

  const handleFormSubmit = async (data: T) => {
    try {
      await onSubmit(data);
    } catch (error) {
      alertDialog.error("An error occurred while submitting the form");
    }
  };

  const onError = (errors: any) => {
    const errorMessages = Object.entries(errors)
      .map(([field, error]: [string, any]) => {
        const fieldConfig = fields.find((f) => f.name === field);
        return error.message || `${fieldConfig?.label || field} is required`;
      })
      .join("\n");
    alertDialog.error(errorMessages);
  };

  const getFieldError = (fieldName: string): string | undefined => {
    const error = formErrors[fieldName];
    return error ? (error as FieldError).message : undefined;
  };

  return (
    <View style={style}>
      {fields.map((field) => (
        <Controller
          key={field.name}
          control={control}
          name={field.name as Path<T>}
          render={({ field: fieldProps }) => (
            <View style={styles.fieldContainer}>
              <FormField
                field={field}
                onChange={fieldProps.onChange}
                onBlur={fieldProps.onBlur}
                value={fieldProps.value}
                error={getFieldError(field.name)}
              />
            </View>
          )}
        />
      ))}
      <CustomButton
        onPress={formHandleSubmit(handleFormSubmit, onError)}
        title={isSubmitting ? "Submitting..." : submitButtonText}
        disabled={isLoading || isSubmitting}
        style={submitButtonStyle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 6,
  },
});
