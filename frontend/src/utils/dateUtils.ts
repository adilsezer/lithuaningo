import {
  format,
  startOfDay,
  addDays,
  subDays,
  parseISO,
  isValid,
} from "date-fns";

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
  return startOfDay(new Date());
};

export const getStartOfYesterday = (): Date => {
  return startOfDay(subDays(new Date(), 1));
};

export const getCurrentDateKey = (): string => {
  const resetHourUTC = 2;
  const now = new Date();
  const utcHour = now.getUTCHours();

  if (utcHour < resetHourUTC) {
    return format(subDays(now, 1), "yyyy-MM-dd");
  }

  return format(now, "yyyy-MM-dd");
};

// New utility functions for standardized date handling
export const formatDate = (
  date: string | Date,
  formatStr: string = "yyyy-MM-dd"
): string => {
  if (typeof date === "string") {
    const parsedDate = parseISO(date);
    if (!isValid(parsedDate)) return "";
    return format(parsedDate, formatStr);
  }
  return format(date, formatStr);
};

export const parseDate = (dateStr: string): Date | null => {
  const parsedDate = parseISO(dateStr);
  return isValid(parsedDate) ? parsedDate : null;
};

export const toISOString = (date: Date): string => {
  return date.toISOString();
};

export const fromISOString = (dateStr: string): Date | null => {
  return parseDate(dateStr);
};

export const formatRelative = (date: string | Date): string => {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsedDate)) return "";

  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return format(parsedDate, "EEEE");
  return format(parsedDate, "dd MMM yyyy");
};
