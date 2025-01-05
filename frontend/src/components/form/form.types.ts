import { UseFormProps, FieldValues } from "react-hook-form";
import { KeyboardType, ViewStyle } from "react-native";

export type FieldCategory =
  | "text-input"
  | "toggle"
  | "selection"
  | "range"
  | "datetime"
  | "media";

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "picker"
  | "switch"
  | "checkbox"
  | "slider"
  | "date"
  | "image";

export type ValidationRule = {
  required?: boolean;
  pattern?: RegExp;
  message?: string;
  minLength?: number;
  maxLength?: number;
  validate?: (value: any, formValues?: any) => string | boolean;
};

export type FormField = {
  name: string;
  label: string;
  category: FieldCategory;
  type: FieldType;
  validation?: ValidationRule;
  defaultValue?: any;

  // Text inputs
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardType;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  editable?: boolean;

  // Selection/Toggle
  options?: Array<{ label: string; value: any }>;

  // Range
  min?: number;
  max?: number;
  step?: number;

  // DateTime
  mode?: "date" | "time";
  minDate?: Date;
  maxDate?: Date;

  // Media
  allowMultiple?: boolean;
  maxSize?: number;
};

export interface FormProps<T extends FieldValues> {
  fields: Array<FormField>;
  onSubmit: (data: T) => Promise<void> | void;
  submitButtonText: string;
  isLoading?: boolean;
  options?: Omit<UseFormProps<T>, "defaultValues">;
  defaultValues?: T;
  style?: ViewStyle;
  submitButtonStyle?: ViewStyle;
}
