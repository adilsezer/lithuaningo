// src/services/notificationService.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { getCurrentDateKey } from "@utils/dateUtils";
import { retrieveData } from "@utils/storageUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIFICATION_PROMPT_KEY = "hasPromptedForNotifications";

// Set notification handler to handle how notifications are presented
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Request notification permissions
async function requestPermissions() {
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
      alert("Failed to enable push notifications!");
      return finalStatus;
    }

    return finalStatus;
  } catch (e) {
    console.error(e);
    return "error";
  }
}

// Check if the user has reviewed today
async function checkIfReviewedToday(
  userId: string | undefined
): Promise<boolean> {
  const COMPLETION_STATUS_KEY = `completionStatus_${userId}_${getCurrentDateKey()}`;
  const completionStatus = await retrieveData<boolean>(COMPLETION_STATUS_KEY);
  return completionStatus ?? false;
}

// Get the next day's date
function getNextDayDate(date: Date): Date {
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);
  return nextDay;
}

// Schedule daily review reminder notification
export async function scheduleDailyReviewReminder(
  userId: string | undefined,
  time: Date,
  forNextDay = false
) {
  await cancelAllScheduledNotifications();

  try {
    const hasReviewedToday = await checkIfReviewedToday(userId);
    if (!hasReviewedToday || forNextDay) {
      const notificationDate = forNextDay ? getNextDayDate(time) : time;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to Review!",
          body: "Keep up the great work! Let's review today's word and boost your Lithuanian skills.",
          sound: "default",
        },
        trigger: {
          hour: notificationDate.getHours(),
          minute: notificationDate.getMinutes(),
          repeats: true,
        },
      });
    }
  } catch (e) {
    console.error(e);
  }
}

// Cancel all scheduled notifications
export async function cancelAllScheduledNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.error("Failed to cancel scheduled notifications:", e);
  }
}

// Check if the user has been prompted for notifications
async function hasPromptedForNotifications() {
  const value = await AsyncStorage.getItem(NOTIFICATION_PROMPT_KEY);
  return value === "true";
}

// Set that the user has been prompted for notifications
async function setPromptedForNotifications() {
  await AsyncStorage.setItem(NOTIFICATION_PROMPT_KEY, "true");
}

// Initialize notifications
export async function initializeNotifications(userId: string | undefined) {
  const hasPrompted = await hasPromptedForNotifications();

  if (!hasPrompted) {
    const permissionStatus = await requestPermissions();
    if (permissionStatus === "granted") {
      const defaultReminderTime = new Date();
      defaultReminderTime.setHours(19, 0, 0, 0);
      await scheduleDailyReviewReminder(userId, defaultReminderTime);
      await setPromptedForNotifications();
    }
  }
}
