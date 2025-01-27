import React, { useEffect } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useUserData } from "@stores/useUserStore";
import CustomButton from "@components/ui/CustomButton";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import BackButton from "@components/layout/BackButton";
import { useComments } from "@hooks/useComments";
import { commentFormSchema } from "@utils/zodSchemas";
import { useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";

export default function CommentsScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const userData = useUserData();
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
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <BackButton />
      <CustomText>Comments</CustomText>
      <Form
        fields={commentFields}
        onSubmit={handleAddComment}
        submitButtonText="Add Comment"
        style={styles.form}
        isLoading={isSubmitting}
        zodSchema={commentFormSchema}
      />
      <FlatList
        data={comments}
        renderItem={({ item }) => (
          <View
            style={[
              styles.commentItem,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <CustomText
              style={[styles.commentText, { color: theme.colors.onSurface }]}
            >
              {item.content}
            </CustomText>
            {userData && userData.id === item.userId && (
              <CustomButton
                title="Delete"
                onPress={() => item.id && deleteComment(item.id, userData.id)}
                disabled={isSubmitting}
              />
            )}
          </View>
        )}
        keyExtractor={(item) => item.id || ""}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <CustomText
            style={[styles.emptyText, { color: theme.colors.onSurface }]}
          >
            {isEmpty ? "No comments yet" : ""}
          </CustomText>
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
});
