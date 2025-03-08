import { apiClient, ApiError } from "../api/apiClient";
import {
  DeckComment,
  CreateDeckCommentRequest,
  UpdateDeckCommentRequest,
} from "@src/types";

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

  async addDeckComment(request: CreateDeckCommentRequest): Promise<string> {
    try {
      const createdDeckComment = await apiClient.createDeckComment(request);
      return createdDeckComment.id;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to add deck comment: ${error.message}`);
      }
      throw error;
    }
  }

  async updateDeckComment(
    id: string,
    request: UpdateDeckCommentRequest
  ): Promise<DeckComment> {
    try {
      return await apiClient.updateDeckComment(id, request);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to update deck comment: ${error.message}`);
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
