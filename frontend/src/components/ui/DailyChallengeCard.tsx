import CustomText from '@components/ui/CustomText';
import React from 'react';
import { View, StyleProp, ViewStyle, ActivityIndicator } from 'react-native';
import { Card, ProgressBar, useTheme, IconButton } from 'react-native-paper';

interface StatItem {
  label: string;
  value: string | number;
  icon?: string;
  iconColor?: string;
}

interface StatsCardProps {
  title: string;
  subtitle?: string;
  stats: StatItem[];
  progress?: number;
  style?: StyleProp<ViewStyle>;
  largeStats?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  subtitle,
  stats,
  progress,
  style,
  largeStats,
  isLoading = false,
  loadingText = 'Loading stats...',
}) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator size='large' color={theme.colors.primary} />
        <CustomText style={{ marginTop: 10 }}>{loadingText}</CustomText>
      </View>
    );
  }

  return (
    <Card
      style={[
        {
          marginVertical: 16,
          padding: 16,
          borderRadius: 16,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.primary,
        },
        style,
      ]}
    >
      <CustomText style={{ marginBottom: 8 }}>{title}</CustomText>
      {subtitle && (
        <CustomText style={{ marginBottom: 16 }}>{subtitle}</CustomText>
      )}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        {stats.map((stat) => (
          <View
            key={stat.label}
            style={{ alignItems: 'center', flex: 1, minWidth: 80 }}
          >
            {stat.icon && (
              <IconButton
                icon={stat.icon}
                size={largeStats ? 24 : 20}
                iconColor={stat.iconColor || theme.colors.primary}
                style={{ marginBottom: 0 }}
              />
            )}
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <CustomText
                variant={largeStats ? 'headlineMedium' : 'titleMedium'}
                style={{ textAlign: 'center' }}
              >
                {stat.value}
              </CustomText>
              <CustomText variant='bodyMedium'>{stat.label}</CustomText>
            </View>
          </View>
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

// Daily Challenge specific implementation
export const DailyChallengeCard: React.FC<{
  answeredQuestions?: number;
  correctAnswers?: number;
  isLoading?: boolean;
}> = ({ answeredQuestions = 0, correctAnswers = 0, isLoading = false }) => {
  const theme = useTheme();
  const wrongAnswers = answeredQuestions - correctAnswers;

  const stats = [
    {
      label: 'Questions\nAnswered',
      value: answeredQuestions,
      icon: 'help',
      iconColor: theme.colors.secondary,
    },
    {
      label: 'Correct\nAnswers',
      value: correctAnswers,
      icon: 'check',
      iconColor: theme.colors.primary,
    },
    {
      label: 'Wrong\nAnswers',
      value: wrongAnswers,
      icon: 'close',
      iconColor: theme.colors.tertiary,
    },
  ];

  return (
    <StatsCard
      title='Daily Challenge'
      subtitle='Here is your progress for today.'
      stats={stats}
      progress={answeredQuestions > 0 ? answeredQuestions / 10 : 0}
      largeStats
      isLoading={isLoading}
    />
  );
};

export default StatsCard;
