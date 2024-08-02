// src/services/notificationService.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { getCurrentDateKey } from "@utils/dateUtils";
import { retrieveData } from "@utils/storageUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIFICATION_PROMPT_KEY = "hasPromptedForNotifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function requestPermissions() {
  if (!Device.isDevice) {
    console.warn("Bypassing physical device check for testing on simulator");
    return "granted";
  }

  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to enable the push notification!");
      return finalStatus;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      throw new Error("Project ID not found");
    }

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

    return finalStatus;
  } catch (e) {
    console.error(e);
    return "error";
  }
}

async function checkIfReviewedToday(
  userId: string | undefined
): Promise<boolean> {
  const COMPLETION_STATUS_KEY = `completionStatus_${userId}_${getCurrentDateKey()}`;
  const completionStatus = await retrieveData<boolean>(COMPLETION_STATUS_KEY);
  return completionStatus ?? false;
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

export async function cancelAllScheduledNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.error("Failed to cancel scheduled notifications:", e);
  }
}

async function hasPromptedForNotifications() {
  const value = await AsyncStorage.getItem(NOTIFICATION_PROMPT_KEY);
  return value === "true";
}

async function setPromptedForNotifications() {
  await AsyncStorage.setItem(NOTIFICATION_PROMPT_KEY, "true");
}

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