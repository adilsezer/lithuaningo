import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { storeData, retrieveData } from "@utils/storageUtils";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const NOTIFICATION_KEYS = {
  NOTIFICATION_PROMPT_KEY: "notification_prompt_key",
  REMINDER_ENABLED: "reminder_enabled",
  REMINDER_TIME: "reminder_time",
  USER_PREF_PUSH_NOTIFICATIONS_ENABLED: "user_pref_push_notifications_enabled",
};

export async function requestPermissions() {
  if (!Device.isDevice) {
    console.warn("Bypassing physical device check for testing on simulator");
    return "granted";
  }

  try {
    if (Platform.OS === "android") {
      try {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#d5304f",
        });
      } catch (e) {
        console.error(e);
      }
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      return finalStatus;
    }

    return finalStatus;
  } catch (e) {
    console.error(e);
    return "error";
  }
}

function getNextDayDate(date: Date): Date {
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);
  return nextDay;
}

export async function scheduleDailyReviewReminder(
  userId: string | undefined,
  time: Date,
  forNextDay = false
) {
  if (!userId) return;

  // Check global user preference first
  const userPrefersNotifications = await retrieveData<boolean>(
    NOTIFICATION_KEYS.USER_PREF_PUSH_NOTIFICATIONS_ENABLED
  );
  if (userPrefersNotifications === false) {
    return; // Do not schedule if globally disabled
  }

  // Check if the specific daily reminder is enabled
  const dailyReminderIsEnabled = await retrieveData<boolean>(
    NOTIFICATION_KEYS.REMINDER_ENABLED
  );
  if (dailyReminderIsEnabled === false) {
    return; // Do not schedule if daily reminder specifically is disabled
  }

  await cancelAllScheduledNotifications();

  try {
    const notificationDate = forNextDay ? getNextDayDate(time) : time;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to Review!",
        body: "Keep up the great work! Let's review today's word and boost your Lithuanian skills.",
        sound: "default",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: notificationDate.getHours(),
        minute: notificationDate.getMinutes(),
      },
    });
  } catch (e) {
    console.error(e);
  }
}

export async function cancelAllScheduledNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.error("Failed to cancel scheduled notifications:", e);
  }
}

async function hasPromptedForNotifications() {
  const value = await retrieveData<boolean>(
    NOTIFICATION_KEYS.NOTIFICATION_PROMPT_KEY
  );
  return value === true;
}

async function setPromptedForNotifications() {
  await storeData(NOTIFICATION_KEYS.NOTIFICATION_PROMPT_KEY, true);
}

export async function initializeNotifications(userId: string | undefined) {
  // Check global user preference first
  const userPrefersNotifications = await retrieveData<boolean>(
    NOTIFICATION_KEYS.USER_PREF_PUSH_NOTIFICATIONS_ENABLED
  );
  if (userPrefersNotifications === false) {
    // If user has turned them off globally, don't proceed with initial setup/prompt.
    return;
  }

  const hasPrompted = await hasPromptedForNotifications();

  if (!hasPrompted) {
    const permissionStatus = await requestPermissions();
    if (permissionStatus === "granted") {
      await storeData(NOTIFICATION_KEYS.REMINDER_ENABLED, true);
      const defaultReminderTime = new Date();
      defaultReminderTime.setHours(19, 0, 0, 0);
      await storeData(
        NOTIFICATION_KEYS.REMINDER_TIME,
        defaultReminderTime.toISOString()
      );
      await scheduleDailyReviewReminder(userId, defaultReminderTime);
      await setPromptedForNotifications();
    }
  }
}
