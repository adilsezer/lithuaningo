import apiClient from "@services/api/apiClient";
import { Announcement } from "@src/types";

const fetchAnnouncements = async (): Promise<Announcement[]> => {
  try {
    return await apiClient.getAnnouncements();
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
};
