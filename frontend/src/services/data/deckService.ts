import apiClient from "@services/api/apiClient";
import { fileUploadService } from "@services/upload/FileUploadService";
import {
  Deck,
  CreateDeckRequest,
  UpdateDeckRequest,
  ImageFile,
} from "@src/types";
import { ApiError } from "@services/api/apiClient";

interface CreateDeckParams {
  request: Omit<CreateDeckRequest, "imageUrl">;
  imageFile?: ImageFile;
}

class DeckService {
  async getPublicDecks(): Promise<Deck[]> {
    try {
      return await apiClient.getPublicDecks();
    } catch (error) {
      console.error("[DeckService.getPublicDecks] Error:", error);
      throw error;
    }
  }

  async getDeck(id: string): Promise<Deck> {
    try {
      return await apiClient.getDeck(id);
    } catch (error) {
      console.error("[DeckService.getDeck] Error:", error);
      throw error;
    }
  }

  async createDeck({ request, imageFile }: CreateDeckParams): Promise<Deck> {
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await fileUploadService.uploadDeckImage(imageFile);
      }

      return await apiClient.createDeck({
        ...request,
        imageUrl,
      });
    } catch (error) {
      console.error("[DeckService.createDeck] Error:", {
        title: request.title,
        error,
      });
      throw error;
    }
  }

  async updateDeck(
    id: string,
    request: Omit<UpdateDeckRequest, "imageUrl">,
    imageFile?: ImageFile
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
      throw error;
    }
  }

  async deleteDeck(id: string): Promise<void> {
    try {
      await apiClient.deleteDeck(id);
    } catch (error) {
      console.error("[DeckService.deleteDeck] Error:", error);
      throw error;
    }
  }

  async getUserDecks(userId: string): Promise<Deck[]> {
    try {
      return await apiClient.getUserDecks(userId);
    } catch (error) {
      console.error("[DeckService.getUserDecks] Error:", error);
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
      console.error("[DeckService.getTopRatedDecks] Error:", error);
      throw error;
    }
  }

  async searchDecks(query: string, category?: string): Promise<Deck[]> {
    try {
      return await apiClient.searchDecks(query, category);
    } catch (error) {
      console.error("[DeckService.searchDecks] Error:", error);
      throw error;
    }
  }
}

export default new DeckService();
