import apiClient from "@services/api/apiClient";
import { DeckComment } from "@src/types";
import { ApiError } from "@services/api/apiClient";

class DeckCommentService {
  async getDeckComments(deckId: string): Promise<DeckComment[]> {
    try {
      return await apiClient.getDeckComments(deckId);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch deck comments: ${error.message}`);
      }
      throw error;
    }
  }

  async addDeckComment(
    comment: Pick<DeckComment, "deckId" | "content" | "userId" | "userName">
  ): Promise<string> {
    try {
      const createdDeckComment = await apiClient.createDeckComment(comment);
      return createdDeckComment.id;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to add deck comment: ${error.message}`);
      }
      throw error;
    }
  }

  async deleteDeckComment(commentId: string): Promise<void> {
    try {
      await apiClient.deleteDeckComment(commentId);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to delete deck comment: ${error.message}`);
      }
      throw error;
    }
  }
}

export default new DeckCommentService();
