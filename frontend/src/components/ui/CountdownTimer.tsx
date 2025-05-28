import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, IconButton, useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";

interface CountdownTimerProps {
  formattedTime: string;
  title?: string;
  subtitle?: string;
  icon?: string;
  onRefresh?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  formattedTime,
  title = "Next Daily Challenge",
  subtitle = "New challenge available in:",
  icon = "clock-outline",
  onRefresh,
}) => {
  const theme = useTheme();

  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.primary,
        },
      ]}
    >
      <Card.Content style={styles.cardContent}>
        {onRefresh && (
          <View style={styles.refreshContainer}>
            <IconButton
              icon="refresh"
              size={20}
              iconColor={theme.colors.onSurfaceVariant}
              onPress={onRefresh}
              style={styles.refreshButton}
            />
          </View>
        )}

        <View
          style={[
            styles.contentContainer,
            onRefresh && styles.contentContainerWithRefresh,
          ]}
        >
          <IconButton
            icon={icon}
            size={28}
            iconColor={theme.colors.primary}
            style={styles.iconButton}
          />

          <CustomText variant="titleMedium" style={styles.title}>
            {title}
          </CustomText>

          <CustomText
            variant="bodyMedium"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            {subtitle}
          </CustomText>

          <CustomText
            variant="headlineSmall"
            style={[styles.timerText, { color: theme.colors.primary }]}
            bold
          >
            {formattedTime}
          </CustomText>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    borderWidth: 1,
  },
  cardContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    position: "relative",
  },
  refreshContainer: {
    position: "absolute",
    top: 4,
    right: 4,
    zIndex: 1,
  },
  refreshButton: {
    margin: 0,
  },
  contentContainer: {
    alignItems: "center",
  },
  contentContainerWithRefresh: {
    paddingTop: 8,
  },
  iconButton: {
    margin: 0,
    marginBottom: 4,
  },
  title: {
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 2,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 12,
  },
  timerText: {
    fontFamily: "monospace",
    letterSpacing: 1,
    textAlign: "center",
  },
});

export default CountdownTimer;
