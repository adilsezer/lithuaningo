import { Alert, AlertButton } from "react-native";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  confirmStyle?: "default" | "cancel" | "destructive";
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
  onCancel?: () => void;
};

type AlertOptions = {
  title?: string;
  message: string;
  buttons?: AlertButton[];
};

export const AlertDialog = {
  confirm: ({
    title,
    message,
    confirmText = "Confirm",
    confirmStyle = "default",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
  }: ConfirmOptions) => {
    Alert.alert(title, message, [
      {
        text: cancelText,
        style: "cancel",
        onPress: onCancel,
      },
      {
        text: confirmText,
        style: confirmStyle,
        onPress: async () => {
          try {
            await onConfirm();
          } catch (error) {
            AlertDialog.error(
              error instanceof Error
                ? error.message
                : "An unexpected error occurred"
            );
          }
        },
      },
    ]);
  },

  show: ({ title = "", message, buttons }: AlertOptions) => {
    Alert.alert(title, message, buttons);
  },

  error: (message: string, title = "Error") => {
    Alert.alert(title, message);
  },

  success: (message: string, title = "Success") => {
    Alert.alert(title, message);
  },

  warning: (message: string, title = "Warning") => {
    Alert.alert(title, message);
  },

  info: (message: string, title = "Info") => {
    Alert.alert(title, message);
  },
};
