import apiClient, { ApiError } from "@services/api/apiClient";
import { Announcement } from "@src/types";

const fetchAnnouncements = async (): Promise<Announcement[]> => {
  try {
    return await apiClient.getAnnouncements();
  } catch (error) {
    if (error instanceof ApiError) {
      //crashlytics().recordError(error);
      console.error(`API Error ${error.status}:`, error.data);
    } else {
      console.error("Error fetching announcements:", error);
    }
    return [];
  }
};

export default {
  fetchAnnouncements,
};
