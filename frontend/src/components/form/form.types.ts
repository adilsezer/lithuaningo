import { UseFormProps, FieldValues } from "react-hook-form";
import { KeyboardType, ViewStyle } from "react-native";
import { z } from "zod";

export type FieldCategory =
  | "text-input"
  | "toggle"
  | "selection"
  | "datetime"
  | "audio-input"
  | "image-input"
  | "link";

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "picker"
  | "switch"
  | "checkbox"
  | "slider"
  | "date"
  | "audio"
  | "image"
  | "link";

export type FormField = {
  name: string;
  label: string;
  category: FieldCategory;
  type: FieldType;
  defaultValue?: any;

  // Text inputs
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardType;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;

  // Selection/Toggle
  options?: Array<{ label: string; value: any }>;

  // DateTime
  mode?: "date" | "time";
  minDate?: Date;
  maxDate?: Date;

  // Image/Audio
  maxSize?: number;
  maxDuration?: number;
  placeholderText?: string;

  // Link
  linkText?: string;
  onPress?: () => void;
};

export interface FormProps<T extends FieldValues> {
  fields: Array<FormField>;
  onSubmit: (data: T) => Promise<void> | void;
  submitButtonText: string;
  isLoading?: boolean;
  options?: Omit<UseFormProps<T>, "defaultValues" | "resolver">;
  defaultValues?: T;
  style?: ViewStyle;
  submitButtonStyle?: ViewStyle;
  zodSchema?: z.ZodType<T>;
}
