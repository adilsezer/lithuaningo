import CustomText from "@components/ui/CustomText";
import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { Card, ProgressBar, useTheme, IconButton } from "react-native-paper";

interface StatItemProps {
  label: string;
  value: string | number;
  icon?: string;
  iconColor?: string;
  isLarge?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({
  label,
  value,
  icon,
  iconColor,
  isLarge,
}) => {
  const theme = useTheme();

  return (
    <View style={{ alignItems: "center", flex: 1, minWidth: 80 }}>
      {icon && (
        <IconButton
          icon={icon}
          size={isLarge ? 24 : 20}
          iconColor={iconColor || theme.colors.primary}
          style={{ marginBottom: 0 }}
        />
      )}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <CustomText
          variant={isLarge ? "headlineMedium" : "titleMedium"}
          style={{ color: theme.colors.onSurface, textAlign: "center" }}
        >
          {value}
        </CustomText>
        <CustomText
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {label}
        </CustomText>
      </View>
    </View>
  );
};

interface StatsCardProps {
  title: string;
  subtitle?: string;
  stats: Array<{
    label: string;
    value: string | number;
    icon?: string;
    iconColor?: string;
  }>;
  progress?: number;
  style?: StyleProp<ViewStyle>;
  largeStats?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  subtitle,
  stats,
  progress,
  style,
  largeStats,
}) => {
  const theme = useTheme();

  return (
    <Card
      style={[
        {
          padding: 16,
          borderRadius: 16,
          backgroundColor: theme.colors.surface,
        },
        style,
      ]}
    >
      <CustomText style={{ marginBottom: 8 }}>{title}</CustomText>
      {subtitle && (
        <CustomText
          style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}
        >
          {subtitle}
        </CustomText>
      )}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {stats.map((stat, index) => (
          <StatItem
            key={index}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            iconColor={stat.iconColor}
            isLarge={largeStats}
          />
        ))}
      </View>
      {progress !== undefined && (
        <ProgressBar
          progress={progress}
          color={theme.colors.primary}
          style={{ marginTop: 16 }}
        />
      )}
    </Card>
  );
};

export default StatsCard;
