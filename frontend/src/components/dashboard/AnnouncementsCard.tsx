import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import { Announcement } from "@src/types";
import { formatRelative } from "@utils/dateUtils";
import CustomDivider from "@components/ui/CustomDivider";

interface AnnouncementsCardProps {
  announcements: Announcement[];
  backgroundColor: string;
}

export const AnnouncementsCard: React.FC<AnnouncementsCardProps> = ({
  announcements,
  backgroundColor,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {announcements.map((announcement) => (
        <React.Fragment key={announcement.id}>
          <Card style={[styles.card, { backgroundColor }]} mode="outlined">
            <Card.Content>
              <CustomText variant="titleMedium" style={styles.title} bold>
                {announcement.title}
              </CustomText>

              <CustomText variant="bodyMedium">
                {announcement.content}
              </CustomText>

              <CustomText variant="labelSmall" style={[styles.date]}>
                Added: {formatRelative(announcement.createdAt)}
                {announcement.updatedAt !== announcement.createdAt &&
                  ` (edited ${formatRelative(announcement.updatedAt)})`}
              </CustomText>
            </Card.Content>
          </Card>
          <CustomDivider />
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginVertical: 16,
  },
  card: {
    borderRadius: 12,
  },
  title: {
    marginBottom: 8,
  },
  content: {
    marginBottom: 16,
    lineHeight: 20,
  },
  date: {
    opacity: 0.7,
  },
});
