import React, { useEffect, useCallback } from "react";
import { useUserData } from "@stores/useUserStore";
import { useSetLoading, useSetError } from "@stores/useUIStore";
import { initializeNotifications } from "@services/notification/notificationService";

const NotificationInitializer: React.FC = () => {
  const userData = useUserData();
  const setLoading = useSetLoading();
  const setError = useSetError();

  useEffect(() => {
    const initNotifications = async () => {
      if (!userData?.id) return;

      try {
        setLoading(true);
        await initializeNotifications(userData.id);
      } catch (error) {
        setError("Failed to initialize notifications");
        console.error("Error initializing notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    initNotifications();
  }, [userData, setLoading, setError]);

  return null;
};

export default NotificationInitializer;
