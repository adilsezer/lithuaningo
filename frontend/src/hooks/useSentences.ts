import { useState, useEffect } from "react";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { Sentence } from "@src/types";
import * as sentenceService from "@services/data/sentenceService";

export const useSentences = () => {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userData = useAppSelector(selectUserData);

  useEffect(() => {
    const fetchSentences = async () => {
      try {
        if (!userData?.id) {
          throw new Error("No user ID available");
        }
        setLoading(true);
        const fetchedSentences = await sentenceService.fetchSentences(
          userData.id
        );
        setSentences(fetchedSentences);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch sentences"
        );
        console.error("Error fetching sentences:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSentences();
  }, [userData?.id]);

  return { sentences, loading, error };
};
