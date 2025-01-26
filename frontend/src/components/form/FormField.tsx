import React from "react";
import { FormField as FormFieldType } from "./form.types";
import { CustomPicker } from "@components/ui/CustomPicker";
import { CustomSwitch } from "@components/ui/CustomSwitch";
import { CustomCheckbox } from "@components/ui/CustomCheckbox";
import { CustomSlider } from "@components/ui/CustomSlider";
import { CustomDatePicker } from "@components/ui/CustomDatePicker";
import { CustomImagePicker } from "@components/ui/CustomImagePicker";
import { CustomAudioPicker } from "@components/ui/CustomAudioPicker";
import { LinkText } from "@components/typography";
import CustomTextInput from "@components/ui/CustomTextInput";

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

    case "range":
      return (
        <CustomSlider
          {...props}
          onValueChange={onChange}
          minimumValue={field.min || 0}
          maximumValue={field.max || 100}
          step={field.step}
        />
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
      return (
        <CustomImagePicker
          {...props}
          onChange={onChange}
          maxSize={field.maxSize}
        />
      );

    case "audio-input":
      return <CustomAudioPicker {...props} onChange={onChange} />;

    case "link":
      return (
        <LinkText onPress={field.onPress}>
          {field.linkText || field.label}
        </LinkText>
      );
  }
};
