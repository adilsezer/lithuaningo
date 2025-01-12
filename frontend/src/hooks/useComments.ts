import { useState, useCallback } from "react";
import { Comment } from "@src/types";
import commentService from "@services/data/commentService";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { setLoading, selectIsLoading } from "@redux/slices/uiSlice";
import { AlertDialog } from "@components/ui/AlertDialog";

export const useComments = (deckId: string) => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const [comments, setComments] = useState<Comment[]>([]);

  const fetchComments = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const data = await commentService.getComments(deckId);
      setComments(data);
    } catch (err) {
      console.error("Error loading comments:", err);
      AlertDialog.error("Failed to load comments");
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, deckId]);

  const addComment = useCallback(
    async (userId: string, content: string) => {
      try {
        await commentService.addComment({
          deckId,
          userId,
          content,
        });
        AlertDialog.success("Comment added successfully");
        await fetchComments();
      } catch (err) {
        AlertDialog.error("Failed to add comment");
        console.error("Error adding comment:", err);
      }
    },
    [deckId, fetchComments]
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      try {
        await commentService.deleteComment(commentId);
        AlertDialog.success("Comment deleted successfully");
        await fetchComments();
      } catch (err) {
        AlertDialog.error("Failed to delete comment");
        console.error("Error deleting comment:", err);
      }
    },
    [fetchComments]
  );

  return {
    comments,
    isLoading,
    fetchComments,
    addComment,
    deleteComment,
  };
};
