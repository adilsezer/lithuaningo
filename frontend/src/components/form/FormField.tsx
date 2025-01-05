import React from "react";
import { useThemeStyles } from "@hooks/useThemeStyles";
import CustomTextInput from "@components/ui/CustomTextInput";
import { CustomPicker } from "@components/ui/CustomPicker";
import { CustomSwitch } from "@components/ui/CustomSwitch";
import { CustomCheckbox } from "@components/ui/CustomCheckbox";
import { CustomSlider } from "@components/ui/CustomSlider";
import { CustomDatePicker } from "@components/ui/CustomDatePicker";
import { CustomImagePicker } from "@components/ui/CustomImagePicker";
import { FormField as FormFieldType } from "./form.types";

interface FormFieldProps {
  field: FormFieldType;
  onChange: (value: any) => void;
  onBlur: () => void;
  value: any;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  onChange,
  onBlur,
  value,
  error,
}) => {
  const { colors } = useThemeStyles();
  const props = {
    label: field.label,
    error,
    value,
    onBlur,
  };

  switch (field.type) {
    case "text":
    case "email":
    case "password":
      return (
        <CustomTextInput
          {...props}
          onChangeText={onChange}
          secureTextEntry={field.type === "password"}
          keyboardType={field.type === "email" ? "email-address" : "default"}
          autoCapitalize={field.autoCapitalize || "none"}
          placeholderTextColor={colors.placeholder}
          placeholder={field.placeholder}
          style={{ textAlign: "center" }}
        />
      );

    case "picker":
      return (
        <CustomPicker
          {...props}
          onValueChange={onChange}
          options={field.options}
        />
      );

    case "switch":
      return <CustomSwitch {...props} onValueChange={onChange} />;

    case "checkbox":
      return <CustomCheckbox {...props} onValueChange={onChange} />;

    case "slider":
      return (
        <CustomSlider
          {...props}
          onValueChange={onChange}
          minimumValue={field.minimumValue || 0}
          maximumValue={field.maximumValue || 100}
          step={field.step}
        />
      );

    case "date":
      return (
        <CustomDatePicker
          {...props}
          onChange={onChange}
          mode={field.mode}
          minimumDate={field.minimumDate}
          maximumDate={field.maximumDate}
        />
      );

    case "image":
      return <CustomImagePicker {...props} onChange={onChange} />;
  }
};
