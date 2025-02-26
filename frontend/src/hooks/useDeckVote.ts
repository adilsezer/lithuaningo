import { useCallback, useState, useEffect } from "react";
import voteService from "@src/services/data/deckVoteService";
import { CreateDeckVoteRequest, DeckVote } from "@src/types";
import {
  useIsLoading,
  useSetLoading,
  useError,
  useSetError,
} from "@stores/useUIStore";

export const useDeckVote = (deckId?: string) => {
  const setLoading = useSetLoading();
  const isLoading = useIsLoading();
  const setError = useSetError();
  const error = useError();
  const [voteCounts, setVoteCounts] = useState<{
    upvotes: number;
    downvotes: number;
  }>({ upvotes: 0, downvotes: 0 });
  const [userVote, setUserVote] = useState<DeckVote | null>(null);

  const voteDeck = useCallback(
    async (request: CreateDeckVoteRequest) => {
      if (!deckId) return false;
      try {
        setLoading(true);
        setError(null);
        const result = await voteService.voteDeck(request);
        if (result) {
          await fetchVoteCounts();
          await fetchUserVote(request.userId);
        }
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to vote");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [deckId, setLoading, setError]
  );

  const fetchVoteCounts = useCallback(async () => {
    if (!deckId) return;
    try {
      setLoading(true);
      const counts = await voteService.getDeckVoteCounts(deckId);
      setVoteCounts(counts);
      return counts;
    } catch (err) {
      console.error("Error fetching vote counts:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch vote counts"
      );
    } finally {
      setLoading(false);
    }
  }, [deckId, setLoading, setError]);

  const fetchUserVote = useCallback(
    async (userId: string) => {
      if (!deckId) return;
      try {
        setLoading(true);
        const vote = await voteService.getUserVote(deckId, userId);
        setUserVote(vote);
      } catch (err) {
        console.error("Error fetching user vote:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch user vote"
        );
      } finally {
        setLoading(false);
      }
    },
    [deckId, setLoading, setError]
  );

  useEffect(() => {
    if (deckId) {
      fetchVoteCounts();
    }
  }, [deckId, fetchVoteCounts]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    isLoading,
    error,
    voteCounts,
    userVote,
    voteDeck,
    fetchVoteCounts,
    fetchUserVote,
    clearError,
  };
};
