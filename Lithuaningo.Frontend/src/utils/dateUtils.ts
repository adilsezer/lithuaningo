import moment from "moment";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export const formatTime = (minutes: number): string => {
  if (minutes === 0) {
    return "0 mins";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours > 0 ? `${hours} hrs ` : ""}${
    remainingMinutes > 0 ? `${remainingMinutes} mins` : ""
  }`.trim();
};

export const getStartOfToday = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const getStartOfYesterday = (): Date => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  return yesterday;
};

export const calculateStreak = (
  lastCompleted: FirebaseFirestoreTypes.Timestamp,
  currentStreak: number
): number => {
  const lastCompletedDate = lastCompleted.toDate();
  const startOfToday = getStartOfToday();
  const startOfYesterday = getStartOfYesterday();

  if (lastCompletedDate >= startOfToday) {
    return currentStreak;
  } else if (lastCompletedDate >= startOfYesterday) {
    return currentStreak + 1;
  } else {
    return 1;
  }
};

export const getCurrentDateKey = () => {
  const resetHourUTC = 2; // 2 am UTC reset time
  const now = moment.utc();
  const todayDateKey = now.format("YYYY-MM-DD");

  // If current time is before reset time, use the previous day's key
  if (now.hour() < resetHourUTC) {
    return moment.utc().subtract(1, "day").format("YYYY-MM-DD");
  }

  return todayDateKey;
};
