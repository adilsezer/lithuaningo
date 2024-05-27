// utils/formatTime.ts
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
