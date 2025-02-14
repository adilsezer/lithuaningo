import apiClient from "@services/api/apiClient";
import { Deck, CreateDeckRequest, UpdateDeckRequest } from "@src/types";
import { ApiError } from "@services/api/apiClient";

class DeckService {
  async getPublicDecks(): Promise<Deck[]> {
    try {
      return await apiClient.getPublicDecks();
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch public decks: ${error.message}`);
      }
      throw error;
    }
  }

  async getDeck(id: string): Promise<Deck> {
    try {
      return await apiClient.getDeck(id);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch deck: ${error.message}`);
      }
      throw error;
    }
  }

  async createDeck(deck: CreateDeckRequest): Promise<Deck> {
    try {
      return await apiClient.createDeck(deck);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to create deck: ${error.message}`);
      }
      throw error;
    }
  }

  async updateDeck(id: string, deck: UpdateDeckRequest): Promise<Deck> {
    try {
      return await apiClient.updateDeck(id, deck);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to update deck: ${error.message}`);
      }
      throw error;
    }
  }

  async deleteDeck(id: string): Promise<void> {
    try {
      await apiClient.deleteDeck(id);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to delete deck: ${error.message}`);
      }
      throw error;
    }
  }

  async getUserDecks(userId: string): Promise<Deck[]> {
    try {
      return await apiClient.getUserDecks(userId);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch user decks: ${error.message}`);
      }
      throw error;
    }
  }

  async getTopRatedDecks(
    limit: number = 10,
    timeRange: "all" | "week" | "month" = "all"
  ): Promise<Deck[]> {
    try {
      return await apiClient.getTopRatedDecks(limit, timeRange);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch top rated decks: ${error.message}`);
      }
      throw error;
    }
  }

  async searchDecks(query: string, category?: string): Promise<Deck[]> {
    try {
      return await apiClient.searchDecks(query, category);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to search decks: ${error.message}`);
      }
      throw error;
    }
  }
}

export default new DeckService();
