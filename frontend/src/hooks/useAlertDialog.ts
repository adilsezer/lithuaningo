// src/hooks/useAlertDialog.ts

import { useAlertActions } from "@stores/useAlertStore";

export type AlertButton = {
  text: string;
  onPress?: () => void;
};

export type AlertOptions = {
  title: string;
  message: string;
  buttons?: AlertButton[];
};

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

export const useAlertDialog = () => {
  const { showAlert, showConfirm, showSuccess, showError } = useAlertActions();

  return {
    showAlert,
    showConfirm,
    showSuccess,
    showError,
  };
};

export default useAlertDialog;
