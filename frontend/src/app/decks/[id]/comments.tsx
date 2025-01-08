import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { Comment } from "@src/types";
import { AlertDialog } from "@components/ui/AlertDialog";
import { SectionTitle } from "@components/typography";
import CustomButton from "@components/ui/CustomButton";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";
import commentService from "@services/data/commentService";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";

export default function CommentsScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useThemeStyles();
  const userData = useAppSelector(selectUserData);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [id]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await commentService.getComments(id as string);
      setComments(data);
    } catch (err) {
      setError("Failed to load comments. Please try again.");
      console.error("Error loading comments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (data: { content: string }) => {
    if (!userData) {
      AlertDialog.error("Please login to comment");
      return;
    }

    try {
      await commentService.addComment({
        deckId: id as string,
        userId: userData.id,
        content: data.content,
      });
      AlertDialog.success("Comment added successfully");
      loadComments();
    } catch (err) {
      AlertDialog.error("Failed to add comment");
      console.error("Error adding comment:", err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentService.deleteComment(commentId);
      AlertDialog.success("Comment deleted successfully");
      loadComments();
    } catch (err) {
      AlertDialog.error("Failed to delete comment");
      console.error("Error deleting comment:", err);
    }
  };

  const commentFields: FormField[] = [
    {
      name: "content",
      label: "Comment",
      category: "text-input",
      type: "text",
      placeholder: "Write your comment...",
      validation: {
        required: true,
        message: "Comment cannot be empty",
      },
    },
  ];

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.active} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <CustomButton title="Retry" onPress={loadComments} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SectionTitle>Comments</SectionTitle>
      <Form
        fields={commentFields}
        onSubmit={handleAddComment}
        submitButtonText="Add Comment"
        style={styles.form}
      />
      <FlatList
        data={comments}
        renderItem={({ item }) => (
          <View style={[styles.commentItem, { backgroundColor: colors.card }]}>
            <Text style={[styles.commentText, { color: colors.text }]}>
              {item.content}
            </Text>
            {userData && userData.id === item.userId && (
              <CustomButton
                title="Delete"
                onPress={() => item.id && handleDeleteComment(item.id)}
                style={[styles.deleteButton, { backgroundColor: colors.error }]}
              />
            )}
          </View>
        )}
        keyExtractor={(item) => item.id || ""}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No comments yet
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 32,
  },
  form: {
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  commentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  commentText: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  deleteButton: {
    minWidth: 80,
  },
});
