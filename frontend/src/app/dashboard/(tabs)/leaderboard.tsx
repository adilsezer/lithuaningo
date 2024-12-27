import React from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useLeaderboard } from "@hooks/useLeaderboard";

const Leaderboard = () => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const leaders = useLeaderboard();

  const getTrophyIcon = (index: number) => {
    switch (index) {
      case 0:
        return (
          <FontAwesome
            name="trophy"
            size={20}
            color={globalColors.secondary}
            style={styles.trophy}
          />
        );
      case 1:
        return (
          <FontAwesome
            name="trophy"
            size={20}
            color={globalColors.primary}
            style={styles.trophy}
          />
        );
      case 2:
        return (
          <FontAwesome
            name="trophy"
            size={20}
            color={globalColors.tertiary}
            style={styles.trophy}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={globalStyles.title}>Leaderboard</Text>
      <Text style={globalStyles.subtitle}>Top Correct Answers This Week</Text>
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
      {leaders.length > 0 ? (
        leaders.map((leader, index) => (
          <View
            key={leader.userId}
            style={[styles.row, { borderBottomColor: globalColors.primary }]}
          >
            <Text style={[globalStyles.text, styles.cell, styles.rank]}>
              {index + 1}
            </Text>
            <Text style={[globalStyles.text, styles.cell, styles.name]}>
              {leader.name} {getTrophyIcon(index)}
            </Text>
            <Text style={[globalStyles.text, styles.cell, styles.score]}>
              {leader.points}
            </Text>
          </View>
        ))
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={globalStyles.text}>
            Be the first to make it to the leaderboard!
          </Text>
          <Text style={globalStyles.text}>
            We're currently waiting for new leaders to emerge.
          </Text>
        </View>
      )}
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
    flexDirection: "row",
    alignItems: "center",
  },
  rank: {
    flex: 1,
    textAlign: "left",
  },
  name: {
    flex: 4,
    textAlign: "left",
  },
  score: {
    flex: 2,
    textAlign: "right",
  },
  trophy: {
    marginLeft: 5,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});

export default Leaderboard;
