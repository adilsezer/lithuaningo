import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

// utils/dateUtils.ts
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
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};
