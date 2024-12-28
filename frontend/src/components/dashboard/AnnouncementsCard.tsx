import React from "react";
import { View, StyleSheet } from "react-native";
import { SectionText } from "@components/typography";

interface AnnouncementsCardProps {
  announcements: Array<{ id: string; title: string; content: string }>;
  backgroundColor: string;
}

export const AnnouncementsCard: React.FC<AnnouncementsCardProps> = ({
  announcements,
  backgroundColor,
}) => (
  <View style={[styles.card, { backgroundColor }]}>
    {announcements.map((a) => (
      <View key={a.id}>
        <SectionText contrast>{a.title}</SectionText>
        <SectionText contrast>{a.content}</SectionText>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    borderWidth: 0.2,
  },
});
