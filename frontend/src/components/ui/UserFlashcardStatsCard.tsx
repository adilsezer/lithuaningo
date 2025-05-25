import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, ProgressBar, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomText from '@components/ui/CustomText';
import { UserFlashcardStatsSummaryResponse } from '@src/types/UserFlashcardStats';

interface UserFlashcardStatItemProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value: number | string;
  label: string;
  color: string;
}

const UserFlashcardStatItem: React.FC<UserFlashcardStatItemProps> = ({
  icon,
  value,
  label,
  color,
}) => {
  const theme = useTheme();
  return (
    <View style={styles.statItem}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <CustomText
        variant='titleMedium'
        style={[styles.statValue, { color: theme.colors.onBackground }]}
      >
        {value}
      </CustomText>
      <CustomText
        variant='bodySmall'
        style={[styles.statLabel, { color: theme.colors.onSurface }]}
      >
        {label}
      </CustomText>
    </View>
  );
};

interface UserFlashcardStatsCardProps {
  stats: UserFlashcardStatsSummaryResponse;
  isLoading?: boolean;
}

export const UserFlashcardStatsCard: React.FC<UserFlashcardStatsCardProps> = ({
  stats,
  isLoading = false,
}) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Card
        style={[
          styles.container,
          {
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <Card.Content>
          <CustomText>Loading stats...</CustomText>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card
      style={[
        styles.container,
        {
          borderColor: theme.colors.primary,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <Card.Content>
        <View style={styles.statsContainer}>
          <UserFlashcardStatItem
            icon='cards'
            value={stats.totalCorrectAnswers + stats.totalIncorrectAnswers}
            label='Total Cards'
            color={theme.colors.tertiary}
          />
          <UserFlashcardStatItem
            icon='check'
            value={stats.totalCorrectAnswers}
            label='Correct'
            color={theme.colors.primary}
          />
          <UserFlashcardStatItem
            icon='close'
            value={stats.totalIncorrectAnswers}
            label='Incorrect'
            color={theme.colors.error}
          />
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <CustomText variant='bodyMedium'>Success Rate</CustomText>
            <CustomText
              variant='bodySmall'
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {stats.successRate.toFixed(1)}%
            </CustomText>
          </View>
          <ProgressBar
            progress={stats.successRate / 100}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <CustomText variant='bodyMedium'>Mastery Level</CustomText>
            <CustomText
              variant='bodySmall'
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {stats.averageMasteryLevel.toFixed(1)}/5.0
            </CustomText>
          </View>
          <ProgressBar
            progress={stats.averageMasteryLevel / 5}
            color={theme.colors.secondary}
            style={styles.progressBar}
          />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontWeight: '600',
    marginTop: 8,
  },
  statLabel: {
    marginTop: 4,
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
});
