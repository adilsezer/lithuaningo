// Type for confirmation dialog options
export type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
};

// Type for custom buttons in alerts
export type ButtonOption = {
  text: string;
  onPress: () => void;
};

// Extended type for alert dialog options to include custom buttons and type
export type AlertOptions = {
  title?: string;
  message: string;
  buttons?: ButtonOption[];
  type?: AlertMode;
};

// Type for different alert modes
export type AlertMode = "ALERT" | "CONFIRM" | "SUCCESS" | "ERROR" | null;
