import React, { useEffect, useState } from "react";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { initializeNotifications } from "@services/notification/notificationService";

const NotificationInitializer: React.FC = () => {
  const userData = useAppSelector(selectUserData);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    const initNotifications = async () => {
      if (userData?.id && !isInitializing) {
        setIsInitializing(true);
        await initializeNotifications(userData.id);
        setIsInitializing(false);
      }
    };

    initNotifications();
  }, [userData]);

  return null;
};

export default NotificationInitializer;
