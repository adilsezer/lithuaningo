import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useLeaderboard } from "@hooks/useLeaderboard";
import { SectionTitle, Subtitle, SectionText } from "@components/typography";
import { LeaderboardEntry } from "@src/types/LeaderboardEntry";
import type { ThemeColors } from "@src/styles/colors";

type TrophyPosition = 0 | 1 | 2;

const TROPHY_COLORS: Record<TrophyPosition, keyof ThemeColors> = {
  0: "secondary", // Gold
  1: "primary", // Silver
  2: "tertiary", // Bronze
};

const TABLE_HEADERS = ["Rank", "Name", "Score"] as const;

type TrophyIconProps = {
  position: number;
  colors: ThemeColors;
};

const TrophyIcon = ({ position, colors }: TrophyIconProps) => {
  if (position > 2) return null;

  return (
    <FontAwesome
      name="trophy"
      size={20}
      color={colors[TROPHY_COLORS[position as TrophyPosition]]}
      style={styles.trophy}
    />
  );
};

type TableHeaderProps = {
  colors: ThemeColors;
};

const TableHeader = ({ colors }: TableHeaderProps) => (
  <View style={[styles.header, { backgroundColor: colors.primary }]}>
    {TABLE_HEADERS.map((title) => (
      <SectionText
        key={title}
        contrast
        style={[
          styles.headerCell,
          styles[title.toLowerCase() as keyof typeof styles],
        ]}
      >
        {title}
      </SectionText>
    ))}
  </View>
);

type LeaderRowProps = {
  entry: LeaderboardEntry;
  position: number;
  colors: ThemeColors;
};

const LeaderRow = ({ entry, position, colors }: LeaderRowProps) => (
  <View style={[styles.row, { borderBottomColor: colors.primary }]}>
    <SectionText style={[styles.cell, styles.rank]}>{position + 1}</SectionText>
    <View style={[styles.cell, styles.nameContainer]}>
      <SectionText>{entry.name}</SectionText>
      <TrophyIcon position={position} colors={colors} />
    </View>
    <SectionText style={[styles.cell, styles.score]}>{entry.score}</SectionText>
  </View>
);

const EmptyState = () => (
  <View style={styles.noDataContainer}>
    <SectionText>Be the first to make it to the leaderboard!</SectionText>
    <SectionText>
      We're currently waiting for new leaders to emerge.
    </SectionText>
  </View>
);

const LeaderboardScreen = () => {
  const { colors } = useThemeStyles();
  const { entries } = useLeaderboard();

  return (
    <ScrollView style={styles.container}>
      <SectionTitle>Leaderboard</SectionTitle>
      <Subtitle>Top Correct Answers This Week</Subtitle>

      <TableHeader colors={colors} />

      {entries.length > 0 ? (
        entries.map((entry, index) => (
          <LeaderRow
            key={entry.id}
            entry={entry}
            position={index}
            colors={colors}
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
