import CustomText from "@components/typography/CustomText";
import React from "react";
import { View, StyleSheet } from "react-native";

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
        <CustomText>{a.title}</CustomText>
        <CustomText>{a.content}</CustomText>
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
