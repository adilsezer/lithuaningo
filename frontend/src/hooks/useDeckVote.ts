import { useCallback, useState } from "react";
import voteService from "@src/services/data/deckVoteService";
import { CreateDeckVoteRequest, DeckVote } from "@src/types";
import {
  useIsLoading,
  useSetLoading,
  useError,
  useSetError,
} from "@stores/useUIStore";

export const useDeckVote = (deckId: string) => {
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
      try {
        setLoading(true);
        setError(null);
        await voteService.voteDeck(request);
        await fetchVoteCounts();
        await fetchUserVote(request.userId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to vote");
        console.error("Error voting deck:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const fetchVoteCounts = useCallback(async () => {
    try {
      setLoading(true);
      const counts = await voteService.getDeckVoteCounts(deckId);
      setVoteCounts(counts);
    } catch (err) {
      console.error("Error fetching vote counts:", err);
    } finally {
      setLoading(false);
    }
  }, [deckId, setLoading]);

  const fetchUserVote = useCallback(
    async (userId: string) => {
      try {
        setLoading(true);
        const vote = await voteService.getUserVote(deckId, userId);
        setUserVote(vote);
      } catch (err) {
        console.error("Error fetching user vote:", err);
      } finally {
        setLoading(false);
      }
    },
    [deckId, setLoading]
  );

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
