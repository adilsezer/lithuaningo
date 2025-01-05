import { UseFormProps, FieldValues } from "react-hook-form";
import { ViewStyle } from "react-native";

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
  required?: string | boolean;
  pattern?: { value: RegExp; message: string };
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  validate?: (value: any, formValues: any) => string | boolean | undefined;
};

export type BaseFieldProps = {
  name: string;
  label: string;
  type: FieldType;
  rules?: ValidationRule;
  defaultValue?: any;
};

export type FieldTypeProps = {
  text: {
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    placeholder?: string;
    editable?: boolean;
  };
  email: {
    autoCapitalize?: "none";
    placeholder?: string;
    editable?: boolean;
  };
  password: { autoCapitalize?: "none"; placeholder?: string };
  picker: { options: Array<{ label: string; value: string }> };
  switch: Record<string, never>;
  checkbox: Record<string, never>;
  slider: { minimumValue?: number; maximumValue?: number; step?: number };
  date: { mode?: "date" | "time"; minimumDate?: Date; maximumDate?: Date };
  image: Record<string, never>;
};

export type FormField = {
  [K in FieldType]: BaseFieldProps & { type: K } & FieldTypeProps[K];
}[FieldType];

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
