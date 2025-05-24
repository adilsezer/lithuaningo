// Type for confirmation dialog options
export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

// Type for custom buttons in alerts
export interface ButtonOption {
  text: string;
  onPress: () => void;
}

// Extended type for alert dialog options to include custom buttons and type
export interface AlertOptions {
  title?: string;
  message: string;
  buttons?: ButtonOption[];
  type?: AlertMode;
}

// Type for different alert modes
export type AlertMode = 'ALERT' | 'CONFIRM' | 'SUCCESS' | 'ERROR' | null;
