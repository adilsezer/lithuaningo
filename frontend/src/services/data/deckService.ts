import apiClient from "../api/apiClient";
import { Deck, Flashcard } from "@src/types";

class DeckService {
  async getDecks(category?: string) {
    return apiClient.getDecks(category);
  }

  async getDeckById(id: string) {
    return apiClient.getDeckById(id);
  }

  async getUserDecks(userId: string) {
    return apiClient.getUserDecks(userId);
  }

  async createDeck(deck: Deck) {
    return apiClient.createDeck(deck);
  }

  async updateDeck(id: string, deck: Deck) {
    return apiClient.updateDeck(id, deck);
  }

  async deleteDeck(id: string) {
    return apiClient.deleteDeck(id);
  }

  async voteDeck(id: string, userId: string, isUpvote: boolean) {
    return apiClient.voteDeck(id, userId, isUpvote);
  }

  async reportDeck(id: string, userId: string, reason: string) {
    return apiClient.reportDeck(id, userId, reason);
  }

  async searchDecks(query: string) {
    return apiClient.searchDecks(query);
  }

  async getTopRatedDecks(limit?: number) {
    return apiClient.getTopRatedDecks(limit);
  }

  async getDeckFlashcards(deckId: string) {
    return apiClient.getDeckFlashcards(deckId);
  }

  async addFlashcardToDeck(deckId: string, flashcard: Flashcard) {
    return apiClient.addFlashcardToDeck(deckId, flashcard);
  }

  async removeFlashcardFromDeck(deckId: string, flashcardId: string) {
    return apiClient.removeFlashcardFromDeck(deckId, flashcardId);
  }

  async getDeckRating(id: string) {
    return apiClient.getDeckRating(id);
  }
}

export default new DeckService();
