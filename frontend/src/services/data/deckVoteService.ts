import apiClient from "@services/api/apiClient";
import {
  DeckVote,
  CreateDeckVoteRequest,
  UpdateDeckVoteRequest,
} from "@src/types";
import { ApiError } from "@services/api/apiClient";

class DeckVoteService {
  async voteDeck(request: CreateDeckVoteRequest): Promise<boolean> {
    try {
      return await apiClient.createDeckVote(request);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to vote deck: ${error.message}`);
      }
      throw error;
    }
  }

  async getUserVote(deckId: string, userId: string): Promise<DeckVote | null> {
    try {
      return await apiClient.getUserVote(deckId, userId);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to get user vote: ${error.message}`);
      }
      throw error;
    }
  }

  async getDeckVotes(deckId: string): Promise<DeckVote[]> {
    try {
      return await apiClient.getDeckVotes(deckId);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to get deck votes: ${error.message}`);
      }
      throw error;
    }
  }

  async getDeckVoteCounts(
    deckId: string
  ): Promise<{ upvotes: number; downvotes: number }> {
    try {
      return await apiClient.getVoteCounts(deckId);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to get vote counts: ${error.message}`);
      }
      throw error;
    }
  }
}

export default new DeckVoteService();
