import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { DataTable, Text, useTheme } from "react-native-paper";
import { format } from "date-fns";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import CustomText from "./CustomText";

export type LeaderboardProps = {
  entries: Array<{
    userId: string;
    name: string;
    score: number;
  }>;
  weekId?: string;
  startDate?: Date | null;
  endDate?: Date | null;
};

const TrophyIcon = ({
  position,
  color,
}: {
  position: number;
  color: string;
}) => {
  const theme = useTheme();
  const positionColors = [
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.tertiary,
  ];

  if (position < 0 || position > 2) return null;
  return (
    <FontAwesome name="trophy" size={20} color={positionColors[position]} />
  );
};

const Leaderboard = ({
  entries,
  weekId,
  startDate,
  endDate,
}: LeaderboardProps) => {
  const theme = useTheme();

  entries = [
    {
      userId: "1",
      name: "John Doe",
      score: 100,
    },
    { userId: "2", name: "Jane Smith", score: 95 },
    { userId: "3", name: "Alice Johnson", score: 90 },
    { userId: "4", name: "Bob Johnson", score: 85 },
    { userId: "5", name: "Charlie Johnson", score: 80 },
    { userId: "6", name: "David Johnson", score: 75 },
    { userId: "7", name: "Eve Johnson", score: 70 },
    { userId: "8", name: "Frank Johnson", score: 65 },
    { userId: "9", name: "Grace Johnson", score: 60 },
    { userId: "10", name: "Hank Johnson", score: 55 },
    { userId: "11", name: "Ian Johnson", score: 50 },
  ];

  const dateRange =
    startDate && endDate
      ? `${format(new Date(startDate), "MMM d")} - ${format(
          new Date(endDate),
          "MMM d, yyyy"
        )}`
      : "This Week";

  return (
    <ScrollView>
      <DataTable
        style={[styles.tableContainer, { borderColor: theme.colors.primary }]}
      >
        {/* Title & Date Range integrated into header */}
        <DataTable.Header
          style={[styles.header, { backgroundColor: theme.colors.primary }]}
        >
          <DataTable.Title style={styles.titleCell}>
            <CustomText variant="titleSmall" bold color="white">
              Leaderboard ({dateRange})
            </CustomText>
          </DataTable.Title>
        </DataTable.Header>

        {/* Table Column Headers */}
        <DataTable.Header
          style={{
            backgroundColor: theme.colors.surface,
          }}
        >
          <DataTable.Title>Rank</DataTable.Title>
          <DataTable.Title style={{ flex: 3 }}>Name</DataTable.Title>
          <DataTable.Title numeric>Score</DataTable.Title>
        </DataTable.Header>

        {/* Data Rows */}
        {entries.length > 0 ? (
          entries.map((entry, index) => (
            <DataTable.Row key={entry.userId}>
              <DataTable.Cell>{index + 1}</DataTable.Cell>
              <DataTable.Cell style={{ flex: 3 }}>
                <View style={styles.nameView}>
                  <TrophyIcon position={index} color={theme.colors.primary} />
                  <CustomText>{entry.name}</CustomText>
                </View>
              </DataTable.Cell>

              <DataTable.Cell numeric>{entry.score}</DataTable.Cell>
            </DataTable.Row>
          ))
        ) : (
          <DataTable.Row>
            <DataTable.Cell style={styles.emptyCell}>
              <CustomText>
                Be the first to make it to the leaderboard!{"\n"}
                We're currently waiting for new leaders to emerge.
              </CustomText>
            </DataTable.Cell>
          </DataTable.Row>
        )}
      </DataTable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
    borderWidth: 1,
    borderRadius: 12,
    marginVertical: 10,
  },
  header: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  titleCell: {
    justifyContent: "center",
  },
  emptyCell: {
    justifyContent: "center",
    alignItems: "center",
  },
  nameView: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

export default Leaderboard;
