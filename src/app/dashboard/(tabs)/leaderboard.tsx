// Leaderboard.tsx
import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import useData from "@src/hooks/useData";

const Leaderboard = () => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const { leaders, loading } = useData();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={globalColors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={globalStyles.title}>Leaderboard</Text>
      <Text style={globalStyles.subtitle}>Last 7 Days</Text>
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
