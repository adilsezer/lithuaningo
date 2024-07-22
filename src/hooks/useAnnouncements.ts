import { useState, useEffect } from "react";
import firestore from "@react-native-firebase/firestore";
import { useAppSelector } from "@src/redux/hooks";
import { selectIsAuthenticated } from "@src/redux/slices/userSlice";

interface Announcement {
  id: string;
  title: string;
  content: string;
}

const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!isAuthenticated) {
        setAnnouncements([]);
        return;
      }

      const snapshot = await firestore().collection("announcements").get();
      const announcementsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Announcement[];
      setAnnouncements(announcementsData);
    };

    fetchAnnouncements();
  }, [isAuthenticated]);

  return announcements;
};

export default useAnnouncements;
