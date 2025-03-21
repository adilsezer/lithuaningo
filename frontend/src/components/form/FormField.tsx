import React, { forwardRef } from "react";
import { FormField as FormFieldType } from "./form.types";
import CustomSwitch from "@components/ui/CustomSwitch";
import CustomTextInput from "@components/ui/CustomTextInput";
import CustomText from "@components/ui/CustomText";

interface FormFieldProps {
  field: FormFieldType;
  onChange: (value: any) => void;
  onBlur: () => void;
  value: any;
  error?: string;
}

export const FormField = forwardRef<any, FormFieldProps>(
  ({ field, onChange, onBlur, value, error }, ref) => {
    const { label, category, type, defaultValue, ...inputProps } = field;
    const props = {
      label,
      error,
      value,
      onBlur,
      ...inputProps,
    };

    switch (category) {
      case "text-input":
        return (
          <CustomTextInput
            {...props}
            ref={ref}
            onChangeText={onChange}
            secureTextEntry={type === "password"}
            keyboardType={type === "email" ? "email-address" : "default"}
            autoCapitalize={field.autoCapitalize || "none"}
          />
        );

      case "toggle":
        return <CustomSwitch {...props} onValueChange={onChange} />;

      case "link":
        return (
          <CustomText
            style={{ textDecorationLine: "underline" }}
            onPress={field.onPress}
          >
            {field.linkText || field.label}
          </CustomText>
        );
    }
  }
);
