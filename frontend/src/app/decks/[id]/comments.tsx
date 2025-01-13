import React, { useEffect } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { SectionTitle } from "@components/typography";
import CustomButton from "@components/ui/CustomButton";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import BackButton from "@components/layout/BackButton";
import { useComments } from "@hooks/useComments";

export default function CommentsScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useThemeStyles();
  const userData = useAppSelector(selectUserData);
  const {
    comments,
    isSubmitting,
    error,
    isEmpty,
    clearError,
    fetchComments,
    addComment,
    deleteComment,
  } = useComments(id as string);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async (data: { content: string }) => {
    if (!userData?.id || !userData?.name) return;
    await addComment(userData.id, data.content, userData.name);
  };

  const commentFields: FormField[] = [
    {
      name: "content",
      label: "Comment",
      category: "text-input",
      type: "text",
      placeholder: userData
        ? "Write your comment..."
        : "Please login to comment",
      validation: {
        required: true,
        message: "Comment cannot be empty",
      },
      editable: !!userData,
    },
  ];

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => {
          clearError();
          fetchComments();
        }}
        fullScreen
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BackButton />
      <SectionTitle>Comments</SectionTitle>
      <Form
        fields={commentFields}
        onSubmit={handleAddComment}
        submitButtonText="Add Comment"
        style={styles.form}
        isLoading={isSubmitting}
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
                onPress={() => item.id && deleteComment(item.id, userData.id)}
                style={[styles.deleteButton, { backgroundColor: colors.error }]}
                disabled={isSubmitting}
              />
            )}
          </View>
        )}
        keyExtractor={(item) => item.id || ""}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.text }]}>
            {isEmpty ? "No comments yet" : ""}
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
