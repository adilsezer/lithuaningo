import { useState, useCallback } from "react";
import { Comment } from "@src/types";
import commentService from "@services/data/commentService";
import { useIsLoading, useSetLoading } from "@stores/useUIStore";
import { useAlertDialog } from "@hooks/useAlertDialog";

export const useComments = (deckId: string) => {
  const { showError, showSuccess } = useAlertDialog();
  // Zustand state
  const setLoading = useSetLoading();
  const isLoading = useIsLoading();

  // Local state
  const [comments, setComments] = useState<Comment[]>([]);
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
  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      const data = await commentService.getComments(deckId);
      setComments(data);
      return true;
    } catch (err) {
      handleError(err, "Failed to load comments");
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, deckId, handleError, clearError]);

  const addComment = useCallback(
    async (userId: string, content: string, username: string) => {
      if (!userId) {
        showError("Please login to comment");
        return false;
      }

      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        deckId,
        userId,
        content,
        createdBy: username,
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        isEdited: false,
      };

      try {
        setIsSubmitting(true);
        clearError();

        // Optimistic update
        setComments((prev) => [optimisticComment, ...prev]);

        const commentId = await commentService.addComment({
          deckId,
          userId,
          content,
          createdBy: username,
        });

        // Update with real ID
        setComments((prev) =>
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
        setComments((prev) =>
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

  const deleteComment = useCallback(
    async (commentId: string, userId: string) => {
      if (!userId) {
        showError("Please login to delete comments");
        return false;
      }

      let deletedComment: Comment | undefined;

      try {
        setIsSubmitting(true);
        clearError();

        // Optimistic update
        deletedComment = comments.find((c) => c.id === commentId);
        if (!deletedComment) {
          throw new Error("Comment not found");
        }
        setComments((prev) =>
          prev.filter((comment) => comment.id !== commentId)
        );

        await commentService.deleteComment(commentId, userId);
        showSuccess("Comment deleted successfully");
        return true;
      } catch (err) {
        // Rollback on error
        if (deletedComment) {
          setComments((prev) => [...prev, deletedComment as Comment]);
        }
        handleError(err, "Failed to delete comment");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [comments, handleError, clearError]
  );

  const likeComment = useCallback(
    async (commentId: string, userId: string) => {
      if (!userId) {
        showError("Please login to like comments");
        return false;
      }

      try {
        setIsSubmitting(true);
        clearError();

        // Optimistic update
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? { ...comment, likes: comment.likes + 1 }
              : comment
          )
        );

        const success = await commentService.likeComment(commentId, userId);
        if (!success) {
          // Rollback if server returns false
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === commentId
                ? { ...comment, likes: comment.likes - 1 }
                : comment
            )
          );
        }
        return success;
      } catch (err) {
        // Rollback on error
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? { ...comment, likes: comment.likes - 1 }
              : comment
          )
        );
        handleError(err, "Failed to like comment");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [handleError, clearError]
  );

  const unlikeComment = useCallback(
    async (commentId: string, userId: string) => {
      if (!userId) {
        showError("Please login to unlike comments");
        return false;
      }

      try {
        setIsSubmitting(true);
        clearError();

        // Optimistic update
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? { ...comment, likes: comment.likes - 1 }
              : comment
          )
        );

        const success = await commentService.unlikeComment(commentId, userId);
        if (!success) {
          // Rollback if server returns false
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === commentId
                ? { ...comment, likes: comment.likes + 1 }
                : comment
            )
          );
        }
        return success;
      } catch (err) {
        // Rollback on error
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? { ...comment, likes: comment.likes + 1 }
              : comment
          )
        );
        handleError(err, "Failed to unlike comment");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [handleError, clearError]
  );

  return {
    // State
    comments,
    isLoading,
    isSubmitting,
    error,
    isEmpty: comments.length === 0,

    // Actions
    clearError,
    fetchComments,
    addComment,
    deleteComment,
    likeComment,
    unlikeComment,
  };
};
