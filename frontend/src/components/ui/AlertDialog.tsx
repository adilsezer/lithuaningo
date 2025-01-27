import React, { createContext, useContext, useState, useCallback } from "react";
import { Portal, Dialog, Button, Text, useTheme } from "react-native-paper";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  confirmStyle?: "default" | "destructive";
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
  onCancel?: () => void;
};

type ShowOptions = {
  title?: string;
  message: string;
  buttons?: { text: string; onPress: () => void }[];
};

type AlertContextType = {
  error: (message: string, title?: string) => void;
  success: (message: string, title?: string) => void;
  confirm: (options: ConfirmOptions) => void;
  show: (options: ShowOptions) => void;
};

const AlertContext = createContext<AlertContextType | null>(null);

export const AlertDialogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [dialogProps, setDialogProps] = useState<React.ReactNode>(null);
  const theme = useTheme();

  const showDialog = useCallback((content: React.ReactNode) => {
    setDialogProps(content);
    setVisible(true);
  }, []);

  const hideDialog = useCallback(() => {
    setVisible(false);
    setDialogProps(null);
  }, []);

  const showConfirmDialog = useCallback(
    ({
      title,
      message,
      confirmText = "Confirm",
      confirmStyle = "default",
      cancelText = "Cancel",
      onConfirm,
      onCancel,
    }: ConfirmOptions) => {
      showDialog(
        <Dialog visible onDismiss={hideDialog}>
          <Dialog.Icon
            icon={confirmStyle === "destructive" ? "alert" : "check-circle"}
            color={
              confirmStyle === "destructive"
                ? theme.colors.error
                : theme.colors.primary
            }
          />
          {title && <Dialog.Title>{title}</Dialog.Title>}
          <Dialog.Content>
            <Text>{message}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                hideDialog();
                onCancel?.();
              }}
            >
              {cancelText}
            </Button>
            <Button
              mode={confirmStyle === "destructive" ? "text" : "contained"}
              onPress={async () => {
                try {
                  await onConfirm();
                } catch {
                  showDialog(
                    <Dialog visible onDismiss={hideDialog}>
                      <Dialog.Icon icon="alert" color={theme.colors.error} />
                      <Dialog.Title>Error</Dialog.Title>
                      <Dialog.Content>
                        <Text>An error occurred during confirmation.</Text>
                      </Dialog.Content>
                      <Dialog.Actions>
                        <Button onPress={hideDialog}>OK</Button>
                      </Dialog.Actions>
                    </Dialog>
                  );
                } finally {
                  hideDialog();
                }
              }}
            >
              {confirmText}
            </Button>
          </Dialog.Actions>
        </Dialog>
      );
    },
    [hideDialog, showDialog, theme]
  );

  const showDialogWithButtons = useCallback(
    ({
      title = "Alert",
      message,
      buttons = [{ text: "OK", onPress: () => {} }],
    }: ShowOptions) => {
      showDialog(
        <Dialog visible onDismiss={hideDialog}>
          <Dialog.Icon icon="information" color={theme.colors.primary} />
          {title && <Dialog.Title>{title}</Dialog.Title>}
          <Dialog.Content>
            <Text>{message}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            {buttons.map((button, index) => (
              <Button
                key={index}
                onPress={() => {
                  button.onPress();
                  hideDialog();
                }}
              >
                {button.text}
              </Button>
            ))}
          </Dialog.Actions>
        </Dialog>
      );
    },
    [hideDialog, showDialog, theme]
  );

  const contextValue = {
    error: useCallback(
      (message: string, title = "Error") => {
        showDialogWithButtons({
          title,
          message,
        });
      },
      [showDialogWithButtons]
    ),

    success: useCallback(
      (message: string, title = "Success") => {
        showDialogWithButtons({
          title,
          message,
        });
      },
      [showDialogWithButtons]
    ),

    confirm: showConfirmDialog,
    show: showDialogWithButtons,
  };

  return (
    <AlertContext.Provider value={contextValue}>
      <Portal.Host>
        {children}
        <Portal>{visible && dialogProps}</Portal>
      </Portal.Host>
    </AlertContext.Provider>
  );
};

export const useAlertDialog = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error(
      "useAlertDialog must be used within an AlertDialogProvider"
    );
  }
  return context;
};
