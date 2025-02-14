import apiClient, { ApiError } from "@services/api/apiClient";
import {
  Announcement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from "@src/types";

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

const createAnnouncement = async (
  request: CreateAnnouncementRequest
): Promise<Announcement | null> => {
  try {
    return await apiClient.createAnnouncement(request);
  } catch (error) {
    if (error instanceof ApiError) {
      //crashlytics().recordError(error);
      console.error(`API Error ${error.status}:`, error.data);
    } else {
      console.error("Error creating announcement:", error);
    }
    return null;
  }
};

const updateAnnouncement = async (
  id: string,
  request: UpdateAnnouncementRequest
): Promise<Announcement | null> => {
  try {
    return await apiClient.updateAnnouncement(id, request);
  } catch (error) {
    if (error instanceof ApiError) {
      //crashlytics().recordError(error);
      console.error(`API Error ${error.status}:`, error.data);
    } else {
      console.error("Error updating announcement:", error);
    }
    return null;
  }
};

const deleteAnnouncement = async (id: string): Promise<boolean> => {
  try {
    await apiClient.deleteAnnouncement(id);
    return true;
  } catch (error) {
    if (error instanceof ApiError) {
      //crashlytics().recordError(error);
      console.error(`API Error ${error.status}:`, error.data);
    } else {
      console.error("Error deleting announcement:", error);
    }
    return false;
  }
};

export default {
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
