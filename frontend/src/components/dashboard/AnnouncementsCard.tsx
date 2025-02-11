import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Chip, useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import { Announcement } from "@src/types";
import {
  formatDate,
  parseDate,
  formatTime,
  formatRelative,
} from "@utils/dateUtils";

interface AnnouncementsCardProps {
  announcements: Announcement[];
  backgroundColor: string;
}

export const AnnouncementsCard: React.FC<AnnouncementsCardProps> = ({
  announcements,
  backgroundColor,
}) => {
  const theme = useTheme();

  const getStatus = (isActive: boolean, validUntil?: string): string => {
    if (!isActive) return "inactive";
    if (validUntil) {
      const endDate = parseDate(validUntil);
      if (endDate && endDate < new Date()) return "expired";
    }
    return "active";
  };

  const getTimeRemaining = (validUntil?: string): string | undefined => {
    if (!validUntil) return undefined;
    const now = new Date();
    const endDate = parseDate(validUntil);
    if (!endDate || endDate <= now) return undefined;
    const diffTime = Math.abs(endDate.getTime() - now.getTime());
    const totalMinutes = Math.floor(diffTime / (1000 * 60));
    if (totalMinutes === 0) return undefined;
    return `${formatTime(totalMinutes)} remaining`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return { text: theme.colors.primary, bg: `${theme.colors.primary}20` };
      case "expired":
        return { text: theme.colors.error, bg: `${theme.colors.error}20` };
      default:
        return { text: theme.colors.outline, bg: `${theme.colors.outline}20` };
    }
  };

  return (
    <Card style={{ backgroundColor, marginTop: 10 }}>
      <Card.Content>
        {announcements.map((announcement) => {
          const status = getStatus(
            announcement.isActive,
            announcement.validUntil
          );
          const timeRemaining = getTimeRemaining(announcement.validUntil);
          const statusColors = getStatusColor(status);

          return (
            <View key={announcement.id} style={styles.announcementContainer}>
              <View style={styles.headerRow}>
                <CustomText variant="titleLarge" style={styles.title}>
                  {announcement.title}
                </CustomText>
                <Chip
                  mode="outlined"
                  style={[
                    styles.statusChip,
                    { backgroundColor: statusColors.bg },
                  ]}
                  textStyle={{ color: statusColors.text }}
                >
                  {status}
                </Chip>
              </View>
              <CustomText variant="bodyMedium" style={styles.content}>
                {announcement.content}
              </CustomText>
              <View style={styles.footerRow}>
                {timeRemaining && (
                  <CustomText variant="bodySmall" style={styles.timeRemaining}>
                    {timeRemaining}
                  </CustomText>
                )}
                <CustomText variant="bodySmall" style={styles.date}>
                  {formatRelative(announcement.createdAt)} at{" "}
                  {formatDate(announcement.createdAt, "HH:mm")}
                  {announcement.updatedAt !== announcement.createdAt &&
                    ` (Updated: ${formatRelative(
                      announcement.updatedAt
                    )} at ${formatDate(announcement.updatedAt, "HH:mm")})`}
                </CustomText>
              </View>
            </View>
          );
        })}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  announcementContainer: {
    marginBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  content: {
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: "column",
    gap: 4,
  },
  statusChip: {
    borderRadius: 16,
  },
  timeRemaining: {
    fontStyle: "italic",
  },
  date: {
    opacity: 0.7,
  },
});
