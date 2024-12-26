import { useState, useEffect } from "react";
import { useAppSelector } from "@redux/hooks";
import { selectIsAuthenticated } from "@redux/slices/userSlice";
import apiClient from "@services/api/apiClient";
import { Announcement } from "@src/types";

const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

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
