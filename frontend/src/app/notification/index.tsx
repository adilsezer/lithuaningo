import React, { useEffect, useState } from "react";
import { Linking } from "react-native";
import NotificationDisplay from "@components/ui/NotificationDisplay";
import { AppInfo } from "@src/types";
import { getLatestAppInfo } from "@services/data/appInfoService";

const NOTIFICATION_CONFIGS = {
  error: {
    title: "Oops!",
    subtitle:
      "We couldn't retrieve the server information. Please try again later.",
    buttonText: "Retry",
  },
  maintenance: {
    title: "Scheduled Maintenance",
    subtitle:
      "Our servers are currently undergoing maintenance. We'll be back shortly. Thank you for your patience!",
  },
  update: {
    title: "Update Available",
    subtitle:
      "A new version of Lithuaningo is available. Please update to continue.",
    buttonText: "Update Now",
  },
} as const;

const NotificationScreen: React.FC = () => {
  const [notification, setNotification] = useState<AppInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAppInfo = async () => {
    try {
      setIsLoading(true);
      setError(false);
      const appInfo = await getLatestAppInfo();
      setNotification(appInfo);
    } catch (err) {
      setError(true);
      console.error("Failed to fetch app info:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppInfo();
  }, []);

  if (isLoading) {
    return null;
  }

  if (error || !notification) {
    return (
      <NotificationDisplay
        {...NOTIFICATION_CONFIGS.error}
        buttonAction={fetchAppInfo}
      />
    );
  }

  if (notification.isUnderMaintenance) {
    return <NotificationDisplay {...NOTIFICATION_CONFIGS.maintenance} />;
  }

  if (notification.updateUrl) {
    return (
      <NotificationDisplay
        {...NOTIFICATION_CONFIGS.update}
        buttonAction={() => {
          Linking.openURL(notification.updateUrl!).catch((err) =>
            console.error("Failed to open URL:", err)
          );
        }}
      />
    );
  }

  return null;
};

export default NotificationScreen;
