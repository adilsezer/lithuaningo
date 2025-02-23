import apiClient from "@services/api/apiClient";
import {
  Deck,
  CreateDeckRequest,
  UpdateDeckRequest,
  ImageFile,
} from "@src/types";
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

  async uploadFile(file: ImageFile): Promise<string> {
    try {
      if (file.type.startsWith("image/")) {
        console.log("[DeckService.uploadFile] Starting image upload:", {
          name: file.name,
          type: file.type,
          size: "N/A",
        });

        const formData = new FormData();
        formData.append("file", {
          uri: file.uri,
          type: file.type,
          name: file.name,
        } as any);

        const url = await apiClient.uploadDeckFile(formData);
        console.log("[DeckService.uploadFile] Image upload successful:", {
          name: file.name,
          url,
        });

        return url;
      } else {
        const error = `Invalid file type: ${file.type}. Only image files are allowed.`;
        console.error("[DeckService.uploadFile] Error:", error);
        throw new Error(error);
      }
    } catch (error) {
      console.error("[DeckService.uploadFile] Error uploading file:", {
        name: file.name,
        type: file.type,
        error,
      });
      throw error;
    }
  }

  async createDeck(
    deck: Omit<CreateDeckRequest, "imageUrl">,
    imageFile?: ImageFile
  ): Promise<Deck> {
    try {
      let imageUrl: string | undefined = undefined;

      if (imageFile) {
        console.log("[DeckService.createDeck] Processing image for deck:", {
          title: deck.title,
          imageName: imageFile.name,
        });

        try {
          imageUrl = await this.uploadFile(imageFile);
          console.log(
            "[DeckService.createDeck] Image processed successfully:",
            {
              title: deck.title,
              imageUrl,
            }
          );
        } catch (error) {
          console.error("[DeckService.createDeck] Image upload failed:", {
            title: deck.title,
            imageName: imageFile.name,
            error,
          });
          // Continue with deck creation even if image upload fails
        }
      }

      console.log("[DeckService.createDeck] Creating deck:", {
        title: deck.title,
        hasImage: !!imageUrl,
      });

      const response = await apiClient.createDeck({
        ...deck,
        imageUrl,
      });

      console.log("[DeckService.createDeck] Deck created successfully:", {
        id: response.id,
        title: response.title,
        imageUrl: response.imageUrl,
      });

      return response;
    } catch (error) {
      console.error("[DeckService.createDeck] Error creating deck:", {
        title: deck.title,
        error,
      });
      if (error instanceof ApiError) {
        throw new Error(`Failed to create deck: ${error.message}`);
      }
      throw error;
    }
  }

  async updateDeck(
    id: string,
    deck: Omit<UpdateDeckRequest, "imageUrl">,
    imageFile?: ImageFile
  ): Promise<Deck> {
    try {
      let imageUrl: string | undefined = undefined;

      if (imageFile) {
        try {
          imageUrl = await this.uploadFile(imageFile);
        } catch (error) {
          console.error("[DeckService.updateDeck] Image upload failed:", {
            id,
            imageName: imageFile.name,
            error,
          });
          // Continue with deck update even if image upload fails
        }
      }

      const response = await apiClient.updateDeck(id, {
        ...deck,
        imageUrl,
      });

      return response;
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
