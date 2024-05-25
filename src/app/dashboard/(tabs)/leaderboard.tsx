import { useThemeStyles } from "@src/hooks/useThemeStyles";
import React from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";

const leaders = [
  { id: 1, name: "Alice", score: 200 },
  { id: 2, name: "Bob", score: 180 },
  { id: 3, name: "Charlie", score: 150 },
  { id: 4, name: "Dave", score: 145 },
  { id: 5, name: "Eve", score: 140 },
  { id: 6, name: "Fiona", score: 135 },
  { id: 7, name: "George", score: 130 },
  { id: 8, name: "Hannah", score: 125 },
  { id: 9, name: "Ian", score: 120 },
  { id: 10, name: "Jane", score: 115 },
  { id: 11, name: "Jane", score: 115 },
  { id: 12, name: "Jane", score: 115 },
  { id: 13, name: "Jane", score: 115 },
  { id: 14, name: "Jane", score: 115 },
  { id: 15, name: "Jane", score: 115 },
  { id: 16, name: "Jane", score: 115 },
  { id: 17, name: "Jane", score: 115 },
  { id: 18, name: "Jane", score: 115 },
  { id: 19, name: "Jane", score: 115 },
  { id: 20, name: "Jane", score: 115 },
  // Add more leaders as needed
];

const Leaderboard = () => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  return (
    <ScrollView style={styles.container}>
      <Text style={globalStyles.title}>Leaderboard</Text>
      <Text style={globalStyles.subtitle}>Last 30 Days</Text>
      <View style={[styles.header, { backgroundColor: globalColors.primary }]}>
        <Text
          style={[styles.headerCell, styles.rank, { color: globalColors.text }]}
        >
          Rank
        </Text>
        <Text
          style={[styles.headerCell, styles.name, { color: globalColors.text }]}
        >
          Name
        </Text>
        <Text
          style={[
            styles.headerCell,
            styles.score,
            { color: globalColors.text },
          ]}
        >
          Score
        </Text>
      </View>
      {leaders.map((leader, index) => (
        <View
          key={leader.id}
          style={[styles.row, { borderBottomColor: globalColors.primary }]}
        >
          <Text
            style={[styles.cell, styles.rank, { color: globalColors.text }]}
          >
            {index + 1}
          </Text>
          <Text
            style={[styles.cell, styles.name, { color: globalColors.text }]}
          >
            {leader.name}
          </Text>
          <Text
            style={[styles.cell, styles.score, { color: globalColors.text }]}
          >
            {leader.score}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  headerCell: {
    fontWeight: "bold",
    padding: 10,
  },
  cell: {
    padding: 10,
  },
  rank: {
    flex: 1,
    textAlign: "center",
  },
  name: {
    flex: 4,
    textAlign: "left",
  },
  score: {
    flex: 2,
    textAlign: "right",
  },
});

export default Leaderboard;
