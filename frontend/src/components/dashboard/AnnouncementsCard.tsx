import React from "react";
import { Card } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
interface AnnouncementsCardProps {
  announcements: Array<{ id: string; title: string; content: string }>;
  backgroundColor: string;
}

export const AnnouncementsCard: React.FC<AnnouncementsCardProps> = ({
  announcements,
  backgroundColor,
}) => (
  <Card style={{ backgroundColor, marginTop: 10 }}>
    <Card.Content>
      {announcements.map((a) => (
        <React.Fragment key={a.id}>
          <CustomText variant="titleLarge">{a.title}</CustomText>
          <CustomText variant="bodyMedium">{a.content}</CustomText>
        </React.Fragment>
      ))}
    </Card.Content>
  </Card>
);
