import apiClient from "@services/api/apiClient";
import { Comment } from "@src/types";
import { ApiError } from "@services/api/apiClient";

class CommentService {
  async getComments(deckId: string): Promise<Comment[]> {
    try {
      return await apiClient.getDeckComments(deckId);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch comments: ${error.message}`);
      }
      throw error;
    }
  }

  async addComment(
    comment: Pick<Comment, "deckId" | "content" | "createdBy" | "userId">
  ): Promise<string> {
    try {
      return await apiClient.addDeckComment(comment);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to add comment: ${error.message}`);
      }
      throw error;
    }
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    try {
      await apiClient.deleteDeckComment(commentId, userId);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to delete comment: ${error.message}`);
      }
      throw error;
    }
  }
}

export default new CommentService();
