import { useState, useCallback } from "react";
import { DeckComment, CreateDeckCommentRequest } from "@src/types";
import deckCommentService from "@src/services/data/deckCommentService";
import { useIsLoading, useSetLoading } from "@stores/useUIStore";
import { useAlertDialog } from "@hooks/useAlertDialog";

export const useDeckComments = (deckId: string) => {
  const { showError, showSuccess } = useAlertDialog();
  // Zustand state
  const setLoading = useSetLoading();
  const isLoading = useIsLoading();

  // Local state
  const [deckComments, setDeckComments] = useState<DeckComment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error handling
  const handleError = useCallback((error: any, message: string) => {
    console.error(message, error);
    setError(message);
    showError(message);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Comments actions
  const fetchDeckComments = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      const data = await deckCommentService.getDeckComments(deckId);
      setDeckComments(data);
      return true;
    } catch (err) {
      handleError(err, "Failed to load comments");
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, deckId, handleError, clearError]);

  const addDeckComment = useCallback(
    async (userId: string, content: string, username: string) => {
      if (!userId) {
        showError("Please login to comment");
        return false;
      }

      const request: CreateDeckCommentRequest = {
        deckId,
        userId,
        content,
      };

      try {
        setIsSubmitting(true);
        clearError();

        const commentId = await deckCommentService.addDeckComment(request);
        await fetchDeckComments(); // Refresh comments to get the new one with server-generated fields

        showSuccess("Comment added successfully");
        return true;
      } catch (err) {
        handleError(err, "Failed to add comment");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [deckId, handleError, clearError, fetchDeckComments]
  );

  const deleteDeckComment = useCallback(
    async (commentId: string) => {
      try {
        setIsSubmitting(true);
        clearError();

        await deckCommentService.deleteDeckComment(commentId);
        await fetchDeckComments(); // Refresh comments to reflect deletion
        showSuccess("Comment deleted successfully");
        return true;
      } catch (err) {
        handleError(err, "Failed to delete comment");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [handleError, clearError, fetchDeckComments]
  );

  return {
    // State
    deckComments,
    isLoading,
    isSubmitting,
    error,
    isEmpty: deckComments.length === 0,

    // Actions
    clearError,
    fetchDeckComments,
    addDeckComment,
    deleteDeckComment,
  };
};
