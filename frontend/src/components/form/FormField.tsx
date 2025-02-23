import React, { forwardRef } from "react";
import { FormField as FormFieldType } from "./form.types";
import { CustomPicker } from "@components/ui/CustomPicker";
import CustomSwitch from "@components/ui/CustomSwitch";
import { CustomCheckbox } from "@components/ui/CustomCheckbox";
import { CustomDatePicker } from "@components/ui/CustomDatePicker";
import { CustomImagePicker } from "@components/ui/CustomImagePicker";
import CustomAudioPicker from "@components/ui/CustomAudioPicker";
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
    const { label, category, type, defaultValue, mode, ...inputProps } = field;
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

      case "selection":
        return (
          <CustomPicker
            {...props}
            onValueChange={onChange}
            options={field.options || []}
          />
        );

      case "toggle":
        return type === "switch" ? (
          <CustomSwitch {...props} onValueChange={onChange} />
        ) : (
          <CustomCheckbox {...props} onValueChange={onChange} />
        );

      case "datetime":
        return (
          <CustomDatePicker
            {...props}
            onChange={onChange}
            mode={field.mode}
            minimumDate={field.minDate}
            maximumDate={field.maxDate}
          />
        );

      case "image-input":
        return <CustomImagePicker {...props} onChange={onChange} />;

      case "audio-input":
        return <CustomAudioPicker {...props} onChange={onChange} />;

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
