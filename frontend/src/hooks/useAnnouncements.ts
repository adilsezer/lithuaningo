import { useState, useEffect } from "react";
import { useIsAuthenticated } from "@stores/useUserStore";
import apiClient from "@services/api/apiClient";
import { Announcement } from "@src/types";

const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!isAuthenticated) {
        setAnnouncements([]);
        return;
      }

      try {
        const announcementsData = await apiClient.getAnnouncements();
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
        setAnnouncements([]);
      }
    };

    fetchAnnouncements();
  }, [isAuthenticated]);

  return announcements;
};

export default useAnnouncements;
