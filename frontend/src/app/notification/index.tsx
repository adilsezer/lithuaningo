import React from "react";
import { useAppInfo } from "@hooks/useAppInfo";
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
  const {
    error,
    maintenanceInfo: { isUnderMaintenance, message },
    versionInfo: { needsUpdate },
    releaseNotes,
    handleUpdate,
  } = useAppInfo();

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (isUnderMaintenance) {
    return (
      <NotificationDisplay
        title={NOTIFICATION_CONFIGS.maintenance.title}
        subtitle={NOTIFICATION_CONFIGS.maintenance.subtitle(message)}
      />
    );
  }

  if (needsUpdate) {
    return (
      <NotificationDisplay
        title={NOTIFICATION_CONFIGS.update.title}
        subtitle={NOTIFICATION_CONFIGS.update.subtitle(releaseNotes)}
        buttonText={NOTIFICATION_CONFIGS.update.buttonText}
        buttonAction={handleUpdate}
      />
    );
  }

  return null;
};

export default NotificationScreen;
