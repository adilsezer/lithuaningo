// src/hooks/useAlertDialog.ts

import { useMemo } from "react";
import { useAlertActions } from "../stores/useAlertStore";
import type {
  AlertOptions,
  ConfirmOptions,
  ButtonOption,
} from "../types/alert";

export const useAlertDialog = () => {
  const actions = useAlertActions();

  return useMemo(
    () => ({
      showAlert: actions.showAlert,
      showConfirm: actions.showConfirm,
      showSuccess: actions.showSuccess,
      showError: actions.showError,
    }),
    [actions]
  );
};

export default useAlertDialog;
