import React from "react";
import { Linking } from "react-native";
import { useAppInfoState } from "@stores/useAppInfoStore";
import NotificationDisplay from "@components/ui/NotificationDisplay";
import ErrorMessage from "@components/ui/ErrorMessage";

const NOTIFICATION_CONFIGS = {
  maintenance: {
    title: "Under Maintenance",
    subtitle: (message?: string) =>
      message ||
      "We're currently performing maintenance. Please try again later.",
  },
  update: {
    title: "Update Required",
    subtitle: (notes?: string) =>
      `Please update to the latest version to continue using the app.${
        notes ? `\n\nWhat's New:\n${notes}` : ""
      }`,
    buttonText: "Update Now",
  },
} as const;

const NotificationScreen: React.FC = () => {
  const { appInfo, error, isUnderMaintenance } = useAppInfoState();

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (isUnderMaintenance) {
    return (
      <NotificationDisplay
        title={NOTIFICATION_CONFIGS.maintenance.title}
        subtitle={NOTIFICATION_CONFIGS.maintenance.subtitle(
          appInfo?.maintenanceMessage
        )}
      />
    );
  }

  if (appInfo?.updateUrl) {
    return (
      <NotificationDisplay
        title={NOTIFICATION_CONFIGS.update.title}
        subtitle={NOTIFICATION_CONFIGS.update.subtitle(appInfo.releaseNotes)}
        buttonText={NOTIFICATION_CONFIGS.update.buttonText}
        buttonAction={() => {
          if (appInfo.updateUrl) {
            Linking.openURL(appInfo.updateUrl).catch((err) =>
              console.error("Failed to open URL:", err)
            );
          }
        }}
      />
    );
  }

  return null;
};

export default NotificationScreen;
