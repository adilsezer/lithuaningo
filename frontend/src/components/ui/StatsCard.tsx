import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { SectionText, Subtitle } from "@components/typography";
import ProgressBar from "@components/ui/ProgressBar";
import { ThemeColors } from "@src/styles/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface StatItemProps {
  label: string;
  value: string | number;
  colors: ThemeColors;
  isLarge?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
}

const StatItem: React.FC<StatItemProps> = ({
  label,
  value,
  colors,
  isLarge,
  icon,
  iconColor,
}) => (
  <View style={[styles.centered, isLarge && styles.largeStat]}>
    <SectionText
      style={[
        styles.statValue,
        { color: colors.cardText },
        isLarge && styles.largeStatValue,
      ]}
    >
      {value}
    </SectionText>
    <View style={styles.labelContainer}>
      {icon && (
        <View
          style={[styles.iconContainer, { backgroundColor: iconColor + "20" }]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={isLarge ? 16 : 14}
            color={iconColor}
            style={styles.icon}
          />
        </View>
      )}
      <SectionText style={[styles.statLabel, { color: colors.cardText }]}>
        {label}
      </SectionText>
    </View>
  </View>
);

interface StatsCardProps {
  title: string;
  subtitle?: string;
  stats: Array<{
    label: string;
    value: string | number;
    icon?: keyof typeof MaterialCommunityIcons.glyphMap;
    iconColor?: string;
  }>;
  colors: ThemeColors;
  progress?: number;
  style?: ViewStyle;
  largeStats?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  subtitle,
  stats,
  colors,
  progress,
  style,
  largeStats,
}) => {
  return (
    <View style={style}>
      <Subtitle style={styles.title}>{title}</Subtitle>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {subtitle && (
          <SectionText style={[styles.subtitle, { color: colors.cardText }]}>
            {subtitle}
          </SectionText>
        )}
        <View style={[styles.row, stats.length > 3 && styles.wrap]}>
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              label={stat.label}
              value={stat.value}
              colors={colors}
              isLarge={largeStats}
              icon={stat.icon}
              iconColor={stat.iconColor}
            />
          ))}
        </View>
        {progress !== undefined && (
          <ProgressBar progress={progress} style={styles.progressBar} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 0.2,
  },
  title: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  largeStatValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
    marginTop: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 16,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  wrap: {
    marginHorizontal: -8,
  },
  centered: {
    alignItems: "center",
    marginVertical: 4,
    flex: 1,
    paddingHorizontal: 8,
    minWidth: 80,
  },
  largeStat: {
    marginVertical: 8,
  },
  progressBar: {
    marginTop: 20,
  },
  labelContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  iconContainer: {
    padding: 6,
    borderRadius: 8,
  },
  icon: {
    opacity: 1,
  },
});
