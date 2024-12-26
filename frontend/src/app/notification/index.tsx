import React, { useEffect, useState } from "react";
import { Linking } from "react-native";
import NotificationDisplay from "@components/ui/NotificationDisplay";
import { AppInfo } from "@src/types";
import { getLatestAppInfo } from "@services/data/appInfoService";

const NotificationScreen: React.FC = () => {
  const [notification, setNotification] = useState<AppInfo | null>(null);

  useEffect(() => {
    const fetchAppInfo = async () => {
      const appInfo = await getLatestAppInfo();
      if (appInfo) {
        setNotification(appInfo);
      }
    };

    fetchAppInfo();
  }, []);

  if (!notification) {
    return (
      <NotificationDisplay
        title="Oops!"
        subtitle="We couldn't retrieve the server information. Please try again later."
        buttonText="Retry"
        buttonAction={() => {}}
      />
    );
  }

  if (notification.isUnderMaintenance) {
    return (
      <NotificationDisplay
        title="Scheduled Maintenance"
        subtitle="Our servers are currently undergoing maintenance. We'll be back shortly. Thank you for your patience!"
      />
    );
  }

  if (notification.updateUrl) {
    return (
      <NotificationDisplay
        title="Update Available"
        subtitle="A new version of Lithuaningo is available. Please update to continue."
        buttonText="Update Now"
        buttonAction={() => {
          Linking.openURL(notification.updateUrl).catch((err) =>
            console.error("Failed to open URL:", err)
          );
        }}
      />
    );
  }

  return null;
};

export default NotificationScreen;
