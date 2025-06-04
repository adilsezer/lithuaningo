import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { View, StyleSheet, TextInput } from "react-native";
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
import { useAlertDialog } from "@hooks/useAlertDialog";

const getDefaultValueByCategory = (field: FormFieldType): string | boolean => {
  switch (field.category) {
    case "toggle":
      return false;
    default:
      return "";
  }
};

type FormComponent = <T extends FieldValues = FieldValues>(
  props: FormProps<T> & { ref?: React.Ref<{ reset: () => void }> }
) => React.ReactElement;

export const Form = forwardRef(function Form<T extends FieldValues>(
  {
    fields,
    onSubmit,
    submitButtonText,
    isLoading = false,
    options,
    defaultValues,
    style,
    submitButtonStyle,
    zodSchema,
  }: FormProps<T>,
  ref: React.Ref<{ reset: () => void }>,
) {
  const firstFieldRef = useRef<TextInput>(null);
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
        {},
      ),
      ...defaultValues,
    } as DefaultValues<T>,
  });

  useImperativeHandle(ref, () => ({
    reset: () => {
      form.reset();
      // Focus on the first field after a short delay to ensure the form is reset
      setTimeout(() => {
        firstFieldRef.current?.focus();
      }, 0);
    },
  }));

  const { showError } = useAlertDialog();

  const {
    control,
    handleSubmit: formHandleSubmit,
    formState: { errors: formErrors, isSubmitting },
  } = form;

  const handleFormSubmit = async (data: T) => {
    try {
      await onSubmit(data);
    } catch {
      showError("An error occurred while submitting the form");
    }
  };

  const onError = (errors: FieldValues) => {
    const errorMessages = Object.entries(errors)
      .map(([field, error]: [string, FieldError | undefined]) => {
        const fieldConfig = fields.find((f) => f.name === field);
        return error?.message || `${fieldConfig?.label || field} is required`;
      })
      .join("\n");
    showError(errorMessages);
  };

  const getFieldError = (fieldName: string): string | undefined => {
    const error = formErrors[fieldName];
    return error ? (error as FieldError).message : undefined;
  };

  return (
    <View style={style}>
      {fields.map((field, index) => (
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
                ref={index === 0 ? firstFieldRef : undefined}
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
}) as FormComponent;

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 6,
  },
});
