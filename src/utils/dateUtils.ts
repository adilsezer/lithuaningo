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
  
  export const getStartOfWeek = (): Date => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday as start of the week
    const startOfWeek = new Date(today.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  };
  