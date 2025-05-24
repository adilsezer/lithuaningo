import { UseFormProps, FieldValues } from 'react-hook-form';
import { KeyboardType, ViewStyle } from 'react-native';
import { z } from 'zod';

export type FieldCategory = 'text-input' | 'toggle' | 'link';

export type FieldType = 'text' | 'email' | 'password' | 'switch' | 'link';

export interface FormField {
  name: string;
  label: string;
  category: FieldCategory;
  type: FieldType;
  defaultValue?: string | boolean;

  // Text inputs
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardType;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;

  // Selection/Toggle
  options?: Array<{ label: string; value: string | number }>;

  // Link
  linkText?: string;
  onPress?: () => void;
}

export interface FormProps<T extends FieldValues> {
  fields: FormField[];
  onSubmit: (data: T) => Promise<void> | void;
  submitButtonText: string;
  isLoading?: boolean;
  options?: Omit<UseFormProps<T>, 'defaultValues' | 'resolver'>;
  defaultValues?: T;
  style?: ViewStyle;
  submitButtonStyle?: ViewStyle;
  zodSchema?: z.ZodType<T>;
}

export interface FormRef {
  reset: () => void;
}
