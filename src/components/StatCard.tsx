// components/StatCard.tsx
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface StatCardProps {
  title: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  const { colors: globalColors } = useThemeStyles();
  return (
    <View style={[styles.statCard, { backgroundColor: globalColors.card }]}>
      <Text style={[styles.cardTitle, { color: globalColors.cardText }]}>
        {title}
      </Text>
      <Text style={[styles.cardValue, { color: globalColors.cardText }]}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    elevation: 4,
    marginHorizontal: 5, // This adds margin to the left and right of each card
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  cardValue: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
});

export default StatCard;
