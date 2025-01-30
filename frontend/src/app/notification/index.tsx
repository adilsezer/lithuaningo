import React from "react";
import { Linking } from "react-native";
import { useAppInfoState } from "@stores/useAppInfoStore";
import NotificationDisplay from "@components/ui/NotificationDisplay";
import ErrorMessage from "@components/ui/ErrorMessage";

const NOTIFICATION_CONFIGS = {
  maintenance: {
    title: "Under Maintenance",
    subtitle: "We're currently performing maintenance. Please try again later.",
  },
  update: {
    title: "Update Required",
    subtitle: "Please update to the latest version to continue using the app.",
    buttonText: "Update Now",
  },
} as const;

const NotificationScreen: React.FC = () => {
  const { appInfo, error, isUnderMaintenance } = useAppInfoState();

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (isUnderMaintenance) {
    return <NotificationDisplay {...NOTIFICATION_CONFIGS.maintenance} />;
  }

  if (appInfo?.updateUrl) {
    return (
      <NotificationDisplay
        {...NOTIFICATION_CONFIGS.update}
        buttonAction={() => {
          Linking.openURL(appInfo.updateUrl!).catch((err) =>
            console.error("Failed to open URL:", err)
          );
        }}
      />
    );
  }

  return null;
};

export default NotificationScreen;
