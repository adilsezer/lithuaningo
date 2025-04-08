import React from "react";
import { useAppInfo } from "@hooks/useAppInfo";
import NotificationDisplay from "@components/ui/NotificationDisplay";
import ErrorMessage from "@components/ui/ErrorMessage";
import { useIsLoading, useError } from "@src/stores/useUIStore";

const NOTIFICATION_CONFIGS = {
  maintenance: {
    title: "Under Maintenance",
    subtitle: (message?: string) =>
      message ||
      "We're currently performing maintenance. Please try again later.",
  },
  update: {
    title: "Update Required",
    subtitle: (notes?: string, version?: string) =>
      `Please update to the latest version${
        version ? ` (${version})` : ""
      } to continue using the app.${notes ? `\n\nWhat's New:\n${notes}` : ""}`,
    buttonText: "Update Now",
  },
  loading: {
    title: "Checking App Status",
    subtitle: "Please wait while we verify application status...",
  },
} as const;

const NotificationScreen: React.FC = () => {
  // Get loading and error from global UI store
  const loading = useIsLoading();
  const error = useError();

  const {
    appInfo,
    isUnderMaintenance,
    maintenanceMessage,
    needsUpdate,
    releaseNotes,
    openUpdateUrl,
  } = useAppInfo();

  if (loading) {
    return (
      <NotificationDisplay
        title={NOTIFICATION_CONFIGS.loading.title}
        subtitle={NOTIFICATION_CONFIGS.loading.subtitle}
      />
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (isUnderMaintenance) {
    return (
      <NotificationDisplay
        title={NOTIFICATION_CONFIGS.maintenance.title}
        subtitle={NOTIFICATION_CONFIGS.maintenance.subtitle(maintenanceMessage)}
      />
    );
  }

  if (needsUpdate) {
    return (
      <NotificationDisplay
        title={NOTIFICATION_CONFIGS.update.title}
        subtitle={NOTIFICATION_CONFIGS.update.subtitle(
          releaseNotes,
          appInfo?.currentVersion
        )}
        buttonText={NOTIFICATION_CONFIGS.update.buttonText}
        buttonAction={openUpdateUrl}
      />
    );
  }

  return null;
};

export default NotificationScreen;
