// components/StatCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface StatCardProps {
  title: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <View style={styles.statCard}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    backgroundColor: "#ECEFF1",
    borderRadius: 8,
    padding: 16,
    elevation: 4,
    marginHorizontal: 5, // This adds margin to the left and right of each card
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  cardValue: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    marginBottom: 10,
  },
});

export default StatCard;
