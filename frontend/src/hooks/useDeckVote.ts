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
  const [userVote, setUserVote] = useState<DeckVote | null>(null);

  const voteDeck = useCallback(
    async (request: CreateDeckVoteRequest) => {
      if (!deckId) return false;
      try {
        console.log("[useDeckVote] Voting for deck:", request);
        setLoading(true);
        setError(null);
        const result = await voteService.voteDeck(request);
        console.log("[useDeckVote] Vote result:", result);
        if (result) {
          console.log("[useDeckVote] Fetching updated user vote");
          await fetchUserVote(request.userId);
        }
        return result;
      } catch (err) {
        console.error("[useDeckVote] Error voting:", err);
        setError(err instanceof Error ? err.message : "Failed to vote");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [deckId, setLoading, setError]
  );

  const fetchUserVote = useCallback(
    async (userId: string) => {
      if (!deckId) return;
      try {
        console.log(
          "[useDeckVote] Fetching user vote for deck:",
          deckId,
          "user:",
          userId
        );
        setLoading(true);
        const vote = await voteService.getUserVote(deckId, userId);
        console.log("[useDeckVote] Received user vote:", vote);
        setUserVote(vote);
      } catch (err) {
        console.error("[useDeckVote] Error fetching user vote:", err);
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
      // We don't need to fetch vote counts on mount anymore
      // as we get them from DeckWithRatingResponse
    }
  }, [deckId]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    isLoading,
    error,
    userVote,
    voteDeck,
    fetchUserVote,
    clearError,
  };
};
