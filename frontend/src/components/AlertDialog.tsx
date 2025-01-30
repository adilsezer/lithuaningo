import React from "react";
import { Portal, Dialog, Button, Text, useTheme } from "react-native-paper";
import useAlertStore, {
  useAlertVisible,
  useAlertMode,
  useAlertDetails,
  useAlertCallbacks,
  useAlertActions,
} from "../stores/useAlertStore";

export const AlertDialog: React.FC = () => {
  const theme = useTheme();
  const visible = useAlertVisible();
  const alertMode = useAlertMode();
  const { title, message, confirmText, cancelText, buttons } =
    useAlertDetails();
  const { onConfirm, onCancel } = useAlertCallbacks();
  const { hideDialog } = useAlertActions();

  if (!visible) return null;

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog}>
        {/* Icon changes based on alert mode */}
        <Dialog.Icon
          icon={
            alertMode === "CONFIRM"
              ? "help-circle"
              : alertMode === "SUCCESS"
              ? "check-circle"
              : alertMode === "ERROR"
              ? "alert-circle"
              : "information"
          }
          color={
            alertMode === "CONFIRM"
              ? theme.colors.primary
              : alertMode === "SUCCESS"
              ? theme.colors.primary
              : alertMode === "ERROR"
              ? theme.colors.error
              : theme.colors.primary
          }
        />
        {/* Dialog Title */}
        {title ? (
          <Dialog.Title style={{ textAlign: "center" }}>{title}</Dialog.Title>
        ) : null}
        {/* Dialog Content */}
        <Dialog.Content>
          <Text style={{ textAlign: "center" }}>{message}</Text>
        </Dialog.Content>
        {/* Dialog Actions */}
        <Dialog.Actions>
          {alertMode === "CONFIRM" ? (
            <>
              <Button
                onPress={() => {
                  hideDialog();
                  onCancel?.();
                }}
              >
                {cancelText}
              </Button>
              <Button
                mode="contained"
                onPress={async () => {
                  try {
                    await onConfirm?.();
                  } catch (err) {
                    console.error("Error in confirmation:", err);
                    // We can use the store directly here
                    useAlertStore
                      .getState()
                      .showError("An error occurred during confirmation.");
                  } finally {
                    hideDialog();
                  }
                }}
              >
                {confirmText}
              </Button>
            </>
          ) : (
            // Render custom buttons or default "OK"
            buttons.map((button, index) => (
              <Button
                key={index}
                onPress={() => {
                  button.onPress();
                  hideDialog();
                }}
              >
                {button.text}
              </Button>
            ))
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
