import { create } from "zustand";
import type {
  AlertOptions,
  ConfirmOptions,
  AlertMode,
  ButtonOption,
} from "../types/alert";

interface AlertState {
  visible: boolean;
  alertMode: AlertMode;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  buttons: ButtonOption[];
  onConfirm: (() => void | Promise<void>) | null;
  onCancel: (() => void) | null;
}

interface AlertActions {
  showAlert: (options: AlertOptions) => void;
  showConfirm: (options: ConfirmOptions) => void;
  showSuccess: (
    message: string,
    title?: string,
    buttons?: ButtonOption[]
  ) => void;
  showError: (
    message: string,
    title?: string,
    buttons?: ButtonOption[]
  ) => void;
  hideDialog: () => void;
}

const initialState: AlertState = {
  visible: false,
  alertMode: null,
  title: "",
  message: "",
  confirmText: "OK",
  cancelText: "Cancel",
  buttons: [],
  onConfirm: null,
  onCancel: null,
};

const useAlertStore = create<AlertState & AlertActions>((set, get) => ({
  ...initialState,

  hideDialog: () => set(initialState),

  showAlert: (options) => {
    const { title = "Alert", message, buttons, type = "ALERT" } = options;
    set({
      visible: true,
      alertMode: type,
      title,
      message,
      buttons: buttons || [{ text: "OK", onPress: () => get().hideDialog() }],
    });
  },

  showConfirm: (options) => {
    const { onConfirm } = options;
    set({
      visible: true,
      alertMode: "CONFIRM",
      title: options.title,
      message: options.message,
      confirmText: options.confirmText ?? "OK",
      cancelText: options.cancelText ?? "Cancel",
      onConfirm: async () => {
        if (onConfirm) {
          await onConfirm();
        }
      },
      onCancel: options.onCancel ?? null,
    });
  },

  showSuccess: (message, title = "Success", buttons) => {
    get().showAlert({ title, message, buttons, type: "SUCCESS" });
  },

  showError: (message, title = "Error", buttons) => {
    get().showAlert({ title, message, buttons, type: "ERROR" });
  },
}));

// Selectors
export const useAlertVisible = () => useAlertStore((state) => state.visible);
export const useAlertMode = () => useAlertStore((state) => state.alertMode);
export const useAlertDetails = () => {
  const state = useAlertStore();
  return {
    title: state.title,
    message: state.message,
    confirmText: state.confirmText,
    cancelText: state.cancelText,
    buttons: state.buttons,
  };
};
export const useAlertCallbacks = () => {
  const state = useAlertStore();
  return {
    onConfirm: state.onConfirm,
    onCancel: state.onCancel,
  };
};
export const useAlertActions = () => {
  const state = useAlertStore();
  return {
    showAlert: state.showAlert,
    showConfirm: state.showConfirm,
    showSuccess: state.showSuccess,
    showError: state.showError,
    hideDialog: state.hideDialog,
  };
};

export default useAlertStore;
