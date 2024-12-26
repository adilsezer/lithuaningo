import moment from "moment";

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

export const getCurrentDateKey = () => {
  const resetHourUTC = 2;
  const now = moment.utc();
  const todayDateKey = now.format("YYYY-MM-DD");

  if (now.hour() < resetHourUTC) {
    return moment.utc().subtract(1, "day").format("YYYY-MM-DD");
  }

  return todayDateKey;
};
