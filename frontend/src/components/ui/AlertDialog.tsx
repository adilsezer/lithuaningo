import React from "react";
import { Portal, Dialog, Button, Text, useTheme } from "react-native-paper";
import { StyleSheet } from "react-native";
import useAlertStore, {
  useAlertVisible,
  useAlertMode,
  useAlertDetails,
  useAlertCallbacks,
  useAlertActions,
} from "@stores/useAlertStore";

export const AlertDialog: React.FC = () => {
  const theme = useTheme();
  const visible = useAlertVisible();
  const alertMode = useAlertMode();
  const { title, message, confirmText, cancelText, buttons } =
    useAlertDetails();
  const { onConfirm, onCancel } = useAlertCallbacks();
  const { hideDialog } = useAlertActions();

  const styles = StyleSheet.create({
    dialog: {
      backgroundColor: theme.colors.surface,
    },
    title: {
      textAlign: "center",
      color: theme.colors.onSurface,
    },
    message: {
      textAlign: "center",
      color: theme.colors.onSurface,
    },
    actionsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      paddingHorizontal: 16,
      gap: 8,
    },
    buttonBase: {
      minWidth: 100,
    },
    containedButtonLabel: {
      fontSize: 14,
      color: theme.colors.onPrimary,
    },
    cancelButtonLabel: {
      fontSize: 14,
      color: theme.colors.error,
    },
  });

  if (!visible) {
    return null;
  }

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={hideDialog}
        dismissable={false}
        style={styles.dialog}
      >
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
          <Dialog.Title style={styles.title}>{title}</Dialog.Title>
        ) : null}
        {/* Dialog Content */}
        <Dialog.Content>
          <Text style={styles.message}>{message}</Text>
        </Dialog.Content>
        {/* Dialog Actions */}
        <Dialog.Actions style={styles.actionsContainer}>
          {alertMode === "CONFIRM" ? (
            <>
              <Button
                mode="outlined"
                onPress={() => {
                  hideDialog();
                  onCancel?.();
                }}
                style={styles.buttonBase}
                labelStyle={styles.cancelButtonLabel}
              >
                {cancelText}
              </Button>
              <Button
                mode="contained"
                onPress={async () => {
                  try {
                    hideDialog(); // Hide dialog first
                    await onConfirm?.();
                  } catch (err) {
                    console.error("Error in confirmation:", err);
                    useAlertStore
                      .getState()
                      .showError("An error occurred during confirmation.");
                  }
                }}
                style={styles.buttonBase}
                buttonColor={theme.colors.primary}
                labelStyle={styles.containedButtonLabel}
              >
                {confirmText}
              </Button>
            </>
          ) : // Render custom buttons or default "OK"
          buttons && buttons.length > 0 ? (
            buttons.map((button, index) => {
              return (
                <Button
                  key={button.text}
                  mode={"outlined"}
                  onPress={() => {
                    hideDialog();
                    button.onPress();
                  }}
                  style={styles.buttonBase}
                  buttonColor={
                    index === buttons.length - 1
                      ? theme.colors.primary
                      : theme.colors.secondary
                  }
                  textColor={
                    index === buttons.length - 1
                      ? theme.colors.onPrimary
                      : theme.colors.onSecondary
                  }
                >
                  {button.text}
                </Button>
              );
            })
          ) : (
            <Button
              mode="contained"
              onPress={hideDialog}
              style={styles.buttonBase}
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
            >
              OK
            </Button>
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
