import apiClient from "../api/apiClient";
import { Deck } from "@src/types";

class DeckService {
  async getDecks(category?: string) {
    return apiClient.getDecks(category);
  }

  async getDeckById(id: string) {
    return apiClient.getDeckById(id);
  }

  async voteDeck(id: string, userId: string, isUpvote: boolean) {
    return apiClient.voteDeck(id, userId, isUpvote);
  }

  async searchDecks(query: string) {
    return apiClient.searchDecks(query);
  }
}

export default new DeckService();
