// hooks/useStats.ts
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
  fetchStats,
  fetchLearningCards,
  fetchLeaderboard,
  updateUserStats,
  Stats,
  LearningCard,
} from '../services/FirebaseDataService';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectUserData } from '../redux/slices/userSlice';
import { setLoading } from '../redux/slices/uiSlice';

interface Leader {
  id: string;
  name: string;
  score: number;
}

interface UseStatsReturn {
  stats: Stats | null;
  cards: LearningCard[];
  leaders: Leader[];
  loading: boolean;
  handleAnswer: (isCorrect: boolean, timeSpent: number) => Promise<void>;
}

const useStats = (): UseStatsReturn => {
  const userData = useAppSelector(selectUserData);
  const dispatch = useAppDispatch();
  const [stats, setStats] = useState<Stats | null>(null);
  const [cards, setCards] = useState<LearningCard[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoadingState] = useState<boolean>(true);

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

  const handleAnswer = async (isCorrect: boolean, timeSpent: number) => {
    if (!userData || !userData.id) return;

    setLoadingState(true);
    try {
      await updateUserStats(userData.id, isCorrect, timeSpent);
    } catch (error) {
    } finally {
      setLoadingState(false);
    }
  };

  return { stats, cards, leaders, loading, handleAnswer };
};

export default useStats;
