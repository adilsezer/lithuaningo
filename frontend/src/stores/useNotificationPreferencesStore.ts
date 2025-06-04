import { create } from "zustand";
import { retrieveData, storeData } from "@utils/storageUtils";
import * as notificationService from "@services/notification/notificationService";
import { NOTIFICATION_KEYS } from "@services/notification/notificationService"; // Assuming NOTIFICATION_KEYS is exported

interface NotificationPreferencesState {
  arePushNotificationsEnabled: boolean;
  isLoading: boolean;
  loadPushNotificationPreference: () => Promise<void>;
  setPushNotificationsEnabled: (
    enabled: boolean,
    userId: string | undefined
  ) => Promise<void>;
}

const USER_PREF_PUSH_NOTIFICATIONS_ENABLED =
  "user_pref_push_notifications_enabled";

const useNotificationPreferencesStore = create<NotificationPreferencesState>(
  (set, _get) => ({
    arePushNotificationsEnabled: true, // Default to true
    isLoading: false,

    loadPushNotificationPreference: async () => {
      set({ isLoading: true });
      try {
        const storedPreference = await retrieveData<boolean>(
          USER_PREF_PUSH_NOTIFICATIONS_ENABLED,
        );
        if (storedPreference !== null) {
          set({ arePushNotificationsEnabled: storedPreference });
        } else {
          // If not stored, default to true and store it
          set({ arePushNotificationsEnabled: true });
          await storeData(USER_PREF_PUSH_NOTIFICATIONS_ENABLED, true);
        }
      } catch (error) {
        console.error("Failed to load push notification preference:", error);
        // Keep default true in case of error
        set({ arePushNotificationsEnabled: true });
      } finally {
        set({ isLoading: false });
      }
    },

    setPushNotificationsEnabled: async (enabled, userId) => {
      set({ isLoading: true, arePushNotificationsEnabled: enabled });
      try {
        await storeData(USER_PREF_PUSH_NOTIFICATIONS_ENABLED, enabled);

        if (enabled) {
          await notificationService.requestPermissions(); // Ensure permissions are requested

          // If daily reminders were enabled, re-schedule them
          const dailyReminderIsEnabled = await retrieveData<boolean>(
            NOTIFICATION_KEYS.REMINDER_ENABLED,
          );
          if (dailyReminderIsEnabled) {
            const reminderTimeISO = await retrieveData<string>(
              NOTIFICATION_KEYS.REMINDER_TIME,
            );
            if (reminderTimeISO) {
              await notificationService.scheduleDailyReviewReminder(
                userId,
                new Date(reminderTimeISO),
              );
            }
          }
        } else {
          await notificationService.cancelAllScheduledNotifications();
        }
      } catch (error) {
        console.error("Failed to set push notification preference:", error);
        // Revert state on error if needed, or handle appropriately
      } finally {
        set({ isLoading: false });
      }
    },
  }),
);

export default useNotificationPreferencesStore;
