import { useState, useCallback } from "react";
import { DeckComment } from "@src/types";
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

      const optimisticComment: DeckComment = {
        id: `temp-${Date.now()}`,
        deckId,
        userId,
        userName: username,
        content,
        timeAgo: "Just now",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEdited: false,
      };

      try {
        setIsSubmitting(true);
        clearError();

        // Optimistic update
        setDeckComments((prev) => [optimisticComment, ...prev]);

        const commentId = await deckCommentService.addDeckComment({
          deckId,
          userId,
          content,
          userName: username,
        });

        // Update with real ID
        setDeckComments((prev) =>
          prev.map((comment) =>
            comment.id === optimisticComment.id
              ? { ...optimisticComment, id: commentId }
              : comment
          )
        );

        showSuccess("Comment added successfully");
        return true;
      } catch (err) {
        // Rollback on error
        setDeckComments((prev) =>
          prev.filter((comment) => comment.id !== optimisticComment.id)
        );
        handleError(err, "Failed to add comment");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [deckId, handleError, clearError]
  );

  const deleteDeckComment = useCallback(
    async (commentId: string) => {
      let deletedComment: DeckComment | undefined;

      try {
        setIsSubmitting(true);
        clearError();

        // Optimistic update
        deletedComment = deckComments.find((c) => c.id === commentId);
        if (!deletedComment) {
          throw new Error("Comment not found");
        }
        setDeckComments((prev) =>
          prev.filter((comment) => comment.id !== commentId)
        );

        await deckCommentService.deleteDeckComment(commentId);
        showSuccess("Deck comment deleted successfully");
        return true;
      } catch (err) {
        // Rollback on error
        if (deletedComment) {
          setDeckComments((prev) => [...prev, deletedComment as DeckComment]);
        }
        handleError(err, "Failed to delete deck comment");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [deckComments, handleError, clearError]
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
