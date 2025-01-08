import apiClient from "../api/apiClient";

export interface Comment {
  id?: string;
  deckId: string;
  userId: string;
  content: string;
  createdAt: string;
}

class CommentService {
  async getComments(deckId: string) {
    return apiClient.getDeckComments(deckId);
  }

  async addComment(comment: Omit<Comment, "id" | "createdAt">) {
    return apiClient.addDeckComment(comment);
  }

  async deleteComment(commentId: string) {
    return apiClient.deleteDeckComment(commentId);
  }
}

export default new CommentService();
