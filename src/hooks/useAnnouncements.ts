import { useState, useEffect } from "react";
import firestore from "@react-native-firebase/firestore";

interface Announcement {
  id: string;
  title: string;
  content: string;
}

const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const snapshot = await firestore().collection("announcements").get();
      const announcementsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Announcement[];
      setAnnouncements(announcementsData);
    };

    fetchAnnouncements();
  }, []);

  return announcements;
};

export default useAnnouncements;
