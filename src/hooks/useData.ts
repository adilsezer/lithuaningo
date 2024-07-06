import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { selectUserData } from "../redux/slices/userSlice";
import sentenceService, { Sentence } from "../services/data/sentenceService";
import wordService, { Word } from "../services/data/wordService";
import userStatsService, { Stats } from "../services/data/userStatsService";

interface Leader {
  id: string;
  name: string;
  score: number;
}

interface UseDataReturn {
  stats: Stats | null;
  sentences: Sentence[];
  words: Word[];
  leaders: Leader[];
  handleAnswer: (isCorrect: boolean, timeSpent: number) => Promise<void>;
}

const useData = (): UseDataReturn => {
  const userData = useAppSelector(selectUserData);
  const dispatch = useAppDispatch();
  const [stats, setStats] = useState<Stats | null>(null);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);

  useEffect(() => {
    if (userData && userData.id) {
      const unsubscribeStats = userStatsService.fetchStats(
        userData.id,
        (newStats) => {
          setStats(newStats);
        }
      );

      const loadSentencesAndWords = async () => {
        try {
          const [newSentences, newWords] = await Promise.all([
            sentenceService.fetchAndShuffleSentences(),
            wordService.fetchWords(),
          ]);
          setSentences(newSentences);
          setWords(newWords);
        } catch (error) {
          console.error("Error loading sentences and words:", error);
        } finally {
        }
      };

      loadSentencesAndWords();

      const unsubscribeLeaders = userStatsService.fetchLeaderboard(
        (newLeaders) => {
          setLeaders(newLeaders);
        }
      );

      return () => {
        unsubscribeStats();
        unsubscribeLeaders();
      };
    } else {
    }
  }, [userData, dispatch]);

  const handleAnswer = async (isCorrect: boolean, timeSpent: number) => {
    if (!userData || !userData.id) return;

    try {
      await userStatsService.updateUserStats(userData.id, isCorrect, timeSpent);
    } catch (error) {
      console.error("Error updating user stats:", error);
    } finally {
    }
  };

  return { stats, sentences, words, leaders, handleAnswer };
};

export default useData;
