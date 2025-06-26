import React from "react";
import { StyleSheet, View, StyleProp, ViewStyle } from "react-native";
import { Card, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppReview } from "@hooks/useAppReview";
import CustomText from "./CustomText";
import CustomButton from "./CustomButton";

interface ReviewRequestCardProps {
  style?: StyleProp<ViewStyle>;
}

export const ReviewRequestCard: React.FC<ReviewRequestCardProps> = ({
  style,
}) => {
  const theme = useTheme();
  const { shouldShowReview, isLoading, requestReview, dismissReview } =
    useAppReview();

  if (!shouldShowReview) {
    return null;
  }

  return (
    <Card
      style={[styles.card, style, { borderColor: theme.colors.primary }]}
      mode="outlined"
    >
      <Card.Content
        style={[
          styles.cardContent,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="star"
            size={24}
            color={theme.colors.primary}
            style={styles.heartIcon}
          />
          <CustomText variant="titleMedium" bold style={styles.title}>
            Love learning Lithuanian? 🇱🇹
          </CustomText>
        </View>

        <CustomText variant="bodyMedium" style={styles.description}>
          Help other language learners discover Lithuaningo! Your review takes
          just 30 seconds but means the world to us.
        </CustomText>

        <View style={styles.buttonContainer}>
          <CustomButton
            title="Skip"
            mode="outlined"
            onPress={dismissReview}
            style={styles.dismissButton}
            contentStyle={styles.buttonContent}
          />
          <CustomButton
            title="Rate Us ⭐"
            mode="contained"
            onPress={requestReview}
            loading={isLoading}
            style={styles.reviewButton}
            contentStyle={styles.buttonContent}
          />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 16,
    marginHorizontal: 0,
  },
  cardContent: {
    paddingVertical: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  heartIcon: {
    marginRight: 8,
  },
  title: {
    flex: 1,
  },
  description: {
    marginBottom: 16,
    lineHeight: 20,
    opacity: 0.8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  dismissButton: {
    flex: 1,
  },
  reviewButton: {
    flex: 1,
  },
  buttonContent: {
    paddingVertical: 4,
  },
});

export default ReviewRequestCard;
