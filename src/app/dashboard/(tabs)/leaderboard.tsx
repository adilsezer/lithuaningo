// Leaderboard.tsx
import React from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import useData from "@src/hooks/useData";

const Leaderboard = () => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const { leaders } = useData();

  return (
    <ScrollView style={styles.container}>
      <Text style={globalStyles.title}>Leaderboard</Text>
      <Text style={globalStyles.subtitle}>Last 7 Days</Text>
      <View style={[styles.header, { backgroundColor: globalColors.primary }]}>
        <Text style={[globalStyles.bold, styles.headerCell, styles.rank]}>
          Rank
        </Text>
        <Text style={[globalStyles.bold, styles.headerCell, styles.name]}>
          Name
        </Text>
        <Text style={[globalStyles.bold, styles.headerCell, styles.score]}>
          Score
        </Text>
      </View>
      {leaders.map((leader, index) => (
        <View
          key={leader.id}
          style={[styles.row, { borderBottomColor: globalColors.primary }]}
        >
          <Text style={[globalStyles.text, styles.cell, styles.rank]}>
            {index + 1}
          </Text>
          <Text style={[globalStyles.text, styles.cell, styles.name]}>
            {leader.name}
          </Text>
          <Text style={[globalStyles.text, styles.cell, styles.score]}>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
