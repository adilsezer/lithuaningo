import { useState, useEffect, useCallback } from "react";
import { useIsAuthenticated } from "@stores/useUserStore";
import announcementService from "@services/data/announcementService";
import {
  Announcement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from "@src/types";

const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = useIsAuthenticated();

  const fetchAnnouncements = useCallback(async () => {
    if (!isAuthenticated) {
      setAnnouncements([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const announcementsData = await announcementService.fetchAnnouncements();
      setAnnouncements(announcementsData);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
      setError("Failed to fetch announcements");
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const createAnnouncement = useCallback(
    async (request: CreateAnnouncementRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const newAnnouncement = await announcementService.createAnnouncement(
          request
        );
        if (newAnnouncement) {
          setAnnouncements((prev) => [...prev, newAnnouncement]);
          return true;
        }
        return false;
      } catch (err) {
        console.error("Failed to create announcement:", err);
        setError("Failed to create announcement");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateAnnouncement = useCallback(
    async (id: string, request: UpdateAnnouncementRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const updatedAnnouncement =
          await announcementService.updateAnnouncement(id, request);
        if (updatedAnnouncement) {
          setAnnouncements((prev) =>
            prev.map((announcement) =>
              announcement.id === id ? updatedAnnouncement : announcement
            )
          );
          return true;
        }
        return false;
      } catch (err) {
        console.error("Failed to update announcement:", err);
        setError("Failed to update announcement");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteAnnouncement = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const success = await announcementService.deleteAnnouncement(id);
      if (success) {
        setAnnouncements((prev) =>
          prev.filter((announcement) => announcement.id !== id)
        );
      }
      return success;
    } catch (err) {
      console.error("Failed to delete announcement:", err);
      setError("Failed to delete announcement");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return {
    announcements,
    isLoading,
    error,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    refreshAnnouncements: fetchAnnouncements,
  };
};

export default useAnnouncements;
