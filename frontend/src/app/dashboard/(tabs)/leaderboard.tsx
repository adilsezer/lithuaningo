import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLeaderboard } from "@hooks/useLeaderboard";
import { format } from "date-fns";
import { useTheme } from "react-native-paper";
import { ThemeColors } from "@src/styles/theme";
import CustomText from "@components/typography/CustomText";

type TrophyPosition = 0 | 1 | 2;

const TROPHY_COLORS: Record<TrophyPosition, keyof ThemeColors> = {
  0: "secondary", // Gold
  1: "primary", // Silver
  2: "tertiary", // Bronze
};

const TABLE_HEADERS = ["Rank", "Name", "Score"] as const;

type TrophyIconProps = {
  position: number;
  color: string;
};

const TrophyIcon = ({ position, color }: TrophyIconProps) => {
  if (position > 2) return null;

  return (
    <FontAwesome name="trophy" size={20} color={color} style={styles.trophy} />
  );
};

type TableHeaderProps = {
  color: string;
};

const TableHeader = ({ color }: TableHeaderProps) => (
  <View style={[styles.header, { backgroundColor: color }]}>
    {TABLE_HEADERS.map((title) => (
      <CustomText
        key={title}
        style={[
          styles.headerCell,
          styles[title.toLowerCase() as keyof typeof styles],
        ]}
      >
        {title}
      </CustomText>
    ))}
  </View>
);

type LeaderRowProps = {
  userId: string;
  name: string;
  score: number;
  rank: number;
  position: number;
  color: string;
};

const LeaderRow = ({ name, score, rank, position, color }: LeaderRowProps) => (
  <View style={[styles.row, { borderBottomColor: color }]}>
    <CustomText style={[styles.cell, styles.rank]}>{rank}</CustomText>
    <View style={[styles.cell, styles.nameContainer]}>
      <CustomText>{name}</CustomText>
      <TrophyIcon position={position} color={color} />
    </View>
    <CustomText style={[styles.cell, styles.score]}>{score}</CustomText>
  </View>
);

const EmptyState = () => (
  <View style={styles.noDataContainer}>
    <CustomText>Be the first to make it to the leaderboard!</CustomText>
    <CustomText>We're currently waiting for new leaders to emerge.</CustomText>
  </View>
);

const LeaderboardScreen = () => {
  const theme = useTheme();
  const { entries, weekId, startDate, endDate } = useLeaderboard();

  const dateRange =
    startDate && endDate
      ? `${format(new Date(startDate), "MMM d")} - ${format(
          new Date(endDate),
          "MMM d, yyyy"
        )}`
      : "This Week";

  return (
    <ScrollView style={styles.container}>
      <CustomText>Leaderboard</CustomText>
      <CustomText>{dateRange}</CustomText>

      <TableHeader color={theme.colors.primary} />

      {entries.length > 0 ? (
        entries.map((entry, index) => (
          <LeaderRow
            key={entry.userId}
            {...entry}
            position={index}
            color={theme.colors.primary}
          />
        ))
      ) : (
        <EmptyState />
      )}
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
  nameContainer: {
    flex: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
});

export default LeaderboardScreen;
