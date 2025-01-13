import { useState, useCallback } from "react";
import { Comment } from "@src/types";
import commentService from "@services/data/commentService";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { setLoading, selectIsLoading } from "@redux/slices/uiSlice";
import { AlertDialog } from "@components/ui/AlertDialog";

export const useComments = (deckId: string) => {
  // Redux state
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);

  // Local state
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error handling
  const handleError = useCallback((error: any, message: string) => {
    console.error(message, error);
    setError(message);
    AlertDialog.error(message);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Comments actions
  const fetchComments = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      clearError();
      const data = await commentService.getComments(deckId);
      setComments(data);
      return true;
    } catch (err) {
      handleError(err, "Failed to load comments");
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, deckId, handleError, clearError]);

  const addComment = useCallback(
    async (userId: string, content: string) => {
      if (!userId) {
        AlertDialog.error("Please login to comment");
        return false;
      }

      try {
        setIsSubmitting(true);
        clearError();
        await commentService.addComment({
          deckId,
          userId,
          content,
        });
        AlertDialog.success("Comment added successfully");
        await fetchComments();
        return true;
      } catch (err) {
        handleError(err, "Failed to add comment");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [deckId, fetchComments, handleError, clearError]
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      try {
        setIsSubmitting(true);
        clearError();
        await commentService.deleteComment(commentId);
        AlertDialog.success("Comment deleted successfully");
        await fetchComments();
        return true;
      } catch (err) {
        handleError(err, "Failed to delete comment");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchComments, handleError, clearError]
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
  };
};
