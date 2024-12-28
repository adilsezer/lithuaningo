import { useState, useEffect } from "react";
import { retrieveData, storeData } from "@utils/storageUtils";
import { NOTIFICATION_KEYS } from "@config/constants";
import {
  cancelAllScheduledNotifications,
  scheduleDailyReviewReminder,
} from "@services/notification/notificationService";
import { AlertDialog } from "@components/ui/AlertDialog";

export const useReminderSettings = (userId?: string) => {
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState<Date | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const enabled = await retrieveData<boolean>(
      NOTIFICATION_KEYS.REMINDER_ENABLED
    );
    const time = await retrieveData<string>(NOTIFICATION_KEYS.REMINDER_TIME);

    setReminderEnabled(enabled === true);
    setReminderTime(time ? new Date(time) : null);
  };

  const saveSettings = async () => {
    try {
      await storeData(NOTIFICATION_KEYS.REMINDER_ENABLED, reminderEnabled);
      if (reminderTime) {
        await storeData(
          NOTIFICATION_KEYS.REMINDER_TIME,
          reminderTime.toISOString()
        );
      }

      if (reminderEnabled && userId && reminderTime) {
        await scheduleDailyReviewReminder(userId, reminderTime);
      } else {
        await cancelAllScheduledNotifications();
      }

      AlertDialog.success("Your settings have been successfully saved");
    } catch (error) {
      AlertDialog.error(
        error instanceof Error ? error.message : "Failed to save settings"
      );
    }
  };

  return {
    reminderEnabled,
    setReminderEnabled,
    reminderTime,
    setReminderTime,
    saveSettings,
  };
};
