// hooks/useFetchData.ts
import { useEffect, useState } from "react";
import {
  fetchStats,
  fetchLearningCards,
  fetchLeaderboard,
  Stats,
  LearningCard,
} from "../services/FirebaseDataService";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { selectUserData } from "../redux/slices/userSlice";
import { setLoading } from "../redux/slices/uiSlice";

const useFetchData = (): {
  stats: Stats | null;
  cards: LearningCard[];
  loading: boolean;
  leaders: { id: string; name: string; score: number }[];
} => {
  const userData = useAppSelector(selectUserData);
  const dispatch = useAppDispatch();
  const [stats, setStats] = useState<Stats | null>(null);
  const [cards, setCards] = useState<LearningCard[]>([]);
  const [loading, setLoadingState] = useState<boolean>(true);
  const [leaders, setLeaders] = useState<
    { id: string; name: string; score: number }[]
  >([]);

  useEffect(() => {
    if (userData && userData.id) {
      dispatch(setLoading(true));
      setLoadingState(true);

      const unsubscribeStats = fetchStats(userData.id, (newStats) => {
        setStats(newStats);
        setLoadingState(false);
        dispatch(setLoading(false));
      });

      const unsubscribeCards = fetchLearningCards((newCards) => {
        setCards(newCards);
        setLoadingState(false);
        dispatch(setLoading(false));
      });

      const unsubscribeLeaders = fetchLeaderboard((newLeaders) => {
        setLeaders(newLeaders);
        setLoadingState(false);
        dispatch(setLoading(false));
      });

      return () => {
        unsubscribeStats();
        unsubscribeCards();
        unsubscribeLeaders();
      };
    } else {
      setLoadingState(false);
      dispatch(setLoading(false));
    }
  }, [userData, dispatch]);

  return { stats, cards, loading, leaders };
};

export default useFetchData;
