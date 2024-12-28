import { useEffect, useState } from "react";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { LeaderboardEntry } from "@src/types/LeaderboardEntry";
import leaderboardService from "@services/data/leaderboardService";

export const useLeaderboard = () => {
  const userData = useAppSelector(selectUserData);
  const [leaderboardEntries, setLeaderboardEntries] = useState<
    LeaderboardEntry[]
  >([]);

  useEffect(() => {
    if (userData?.id) {
      leaderboardService
        .getLeaderboardEntries()
        .then((newLeaderboardEntries) => {
          setLeaderboardEntries(newLeaderboardEntries);
        });

      return () => {};
    }
  }, [userData]);

  const updateEntry = async (entry: LeaderboardEntry) => {
    const updatedEntry = await leaderboardService.updateLeaderboardEntry(entry);
    if (!updatedEntry) return;

    setLeaderboardEntries((prevEntries) =>
      prevEntries.map((e) => (e.id === entry.id ? updatedEntry : e))
    );
  };

  return {
    entries: leaderboardEntries,
    updateEntry,
  };
};
