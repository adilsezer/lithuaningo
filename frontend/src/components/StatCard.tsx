// components/StatCard.tsx
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface StatCardProps {
  title: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  return (
    <View style={[styles.statCard, { backgroundColor: globalColors.card }]}>
      <Text style={[globalStyles.bold, { color: globalColors.cardText }]}>
        {title}
      </Text>
      <Text style={[globalStyles.text, { color: globalColors.cardText }]}>
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
});

export default StatCard;
