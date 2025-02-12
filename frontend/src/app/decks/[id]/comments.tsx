import React, { useEffect } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useUserData } from "@stores/useUserStore";
import CustomButton from "@components/ui/CustomButton";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import BackButton from "@components/layout/BackButton";
import { useDeckComments } from "@hooks/useComments";
import { deckCommentFormSchema } from "@utils/zodSchemas";
import { useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";

export default function DeckCommentsScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const userData = useUserData();
  const {
    deckComments,
    isSubmitting,
    error,
    isEmpty,
    clearError,
    fetchDeckComments,
    addDeckComment,
    deleteDeckComment,
  } = useDeckComments(id as string);

  useEffect(() => {
    fetchDeckComments();
  }, [fetchDeckComments]);

  const handleAddComment = async (data: { content: string }) => {
    if (!userData?.id || !userData?.fullName) return;
    await addDeckComment(userData.id, data.content, userData.fullName);
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
          fetchDeckComments();
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
      <CustomText variant="titleLarge" bold>
        Deck Comments
      </CustomText>
      <Form
        fields={commentFields}
        onSubmit={handleAddComment}
        submitButtonText="Add Comment"
        style={styles.form}
        isLoading={isSubmitting}
        zodSchema={deckCommentFormSchema}
      />
      <FlatList
        data={deckComments}
        renderItem={({ item }) => (
          <View
            style={[
              styles.commentItem,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.commentHeader}>
              <CustomText variant="labelLarge" style={styles.userName}>
                {item.userName}
              </CustomText>
              <CustomText variant="labelSmall" style={styles.timeAgo}>
                {item.timeAgo}
                {item.isEdited && " (edited)"}
              </CustomText>
            </View>
            <CustomText
              style={[styles.commentText, { color: theme.colors.onSurface }]}
            >
              {item.content}
            </CustomText>
            {userData && userData.id === item.userId && (
              <View style={styles.actionButtons}>
                <CustomButton
                  title="Delete"
                  onPress={() => item.id && deleteDeckComment(item.id)}
                  disabled={isSubmitting}
                />
              </View>
            )}
          </View>
        )}
        keyExtractor={(item) => item.id}
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  userName: {
    fontWeight: "bold",
  },
  timeAgo: {
    opacity: 0.7,
  },
  commentText: {
    fontSize: 14,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
