import { apiClient, ApiError } from "@services/api/apiClient";
import { fileUploadService } from "@services/upload/FileUploadService";
import {
  Deck,
  CreateDeckRequest,
  UpdateDeckRequest,
  ImageFile,
  DeckWithRatingResponse,
} from "@src/types";

interface CreateDeckParams {
  request: Omit<CreateDeckRequest, "imageUrl">;
  imageFile?: ImageFile;
}

/**
 * Service for handling deck-related operations with the API
 */
class DeckService {
  /**
   * Get top rated decks with optional filtering
   * @param limit Maximum number of decks to return
   * @param timeRange Time range for rating calculation
   * @returns Promise with array of decks with ratings
   */
  async getTopRatedDecks(
    limit: number = 10,
    timeRange: "all" | "week" | "month" = "all"
  ): Promise<DeckWithRatingResponse[]> {
    try {
      return await apiClient.getTopRatedDecks(limit, timeRange);
    } catch (error) {
      console.error("[DeckService.getTopRatedDecks] Error:", error);
      throw this.formatError(error, "Failed to get top rated decks");
    }
  }

  /**
   * Get all public decks
   * @param limit Maximum number of decks to return per page
   * @param page Page number (1-based)
   * @returns Promise with array of decks
   */
  async getPublicDecks(limit?: number, page?: number): Promise<Deck[]> {
    try {
      return await apiClient.getPublicDecks(limit, page);
    } catch (error) {
      console.error("[DeckService.getPublicDecks] Error:", error);
      throw this.formatError(error, "Failed to get public decks");
    }
  }

  /**
   * Get a specific deck by ID
   * @param id Deck ID
   * @returns Promise with deck data
   */
  async getDeck(id: string): Promise<Deck> {
    try {
      return await apiClient.getDeck(id);
    } catch (error) {
      console.error("[DeckService.getDeck] Error:", error);
      throw this.formatError(error, `Failed to get deck with ID: ${id}`);
    }
  }

  /**
   * Create a new deck with optional image
   * @param params Object containing request data and optional image file
   * @returns Promise with created deck data
   */
  async createDeck({ request, imageFile }: CreateDeckParams): Promise<Deck> {
    try {
      // First handle image upload if provided
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await fileUploadService.uploadDeckImage(imageFile);
      }

      // Then create the deck with the image URL
      return await apiClient.createDeck({
        ...request,
        imageUrl,
      });
    } catch (error) {
      console.error("[DeckService.createDeck] Error:", {
        title: request.title,
        error,
      });
      throw this.formatError(error, "Failed to create deck");
    }
  }

  /**
   * Update an existing deck with optional new image
   * @param id Deck ID
   * @param request Updated deck data
   * @param imageFile Optional new image file
   * @returns Promise with updated deck data
   */
  async updateDeck(
    id: string,
    request: Omit<UpdateDeckRequest, "imageUrl">,
    imageFile?: ImageFile | null
  ): Promise<Deck> {
    try {
      // First handle image upload if provided
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await fileUploadService.uploadDeckImage(imageFile);
      }

      // Then update the deck with the image URL
      return await apiClient.updateDeck(id, {
        ...request,
        imageUrl,
      });
    } catch (error) {
      console.error("[DeckService.updateDeck] Error:", error);
      throw this.formatError(error, `Failed to update deck with ID: ${id}`);
    }
  }

  /**
   * Delete a deck by ID
   * @param id Deck ID
   * @returns Promise that resolves when deletion is complete
   */
  async deleteDeck(id: string): Promise<void> {
    try {
      await apiClient.deleteDeck(id);
    } catch (error) {
      console.error("[DeckService.deleteDeck] Error:", error);
      throw this.formatError(error, `Failed to delete deck with ID: ${id}`);
    }
  }

  /**
   * Search for decks by query and optional category
   * @param query Search query string
   * @param category Optional category to filter by
   * @returns Promise with array of matching decks
   */
  async searchDecks(query: string, category?: string): Promise<Deck[]> {
    try {
      return await apiClient.searchDecks(query, category);
    } catch (error) {
      console.error("[DeckService.searchDecks] Error:", error);
      throw this.formatError(error, "Failed to search decks");
    }
  }

  /**
   * Format error for consistent error handling
   * @param error Original error
   * @param defaultMessage Default message if error doesn't have one
   * @returns Formatted Error object
   */
  private formatError(error: any, defaultMessage: string): Error {
    if (error instanceof ApiError) {
      return new Error(error.message || defaultMessage);
    }
    return new Error(error?.message || defaultMessage);
  }
}

export default new DeckService();
