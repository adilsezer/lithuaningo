import React from "react";
import { View, StyleSheet } from "react-native";
import {
  Surface,
  SegmentedButtons,
  DataTable,
  Chip,
  Icon,
  useTheme,
} from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import { StatsPanelProps } from "../../types/practiceTypes";

export const StatsPanel: React.FC<StatsPanelProps> = ({
  statsTab,
  setStatsTab,
  stats,
  theme,
}) => {
  return (
    <Surface style={styles.statsPanel} elevation={1}>
      <SegmentedButtons
        value={statsTab}
        onValueChange={setStatsTab}
        buttons={[
          { value: "main", label: "Main", icon: "star-outline" },
          { value: "performance", label: "Performance", icon: "chart-line" },
          { value: "time", label: "Time", icon: "clock-outline" },
        ]}
        style={styles.segmentedButtons}
        density="small"
      />

      {statsTab === "main" && (
        <DataTable>
          <DataTable.Row>
            <DataTable.Cell style={styles.iconCell}>
              <Icon source="fire" size={20} color={theme.colors.primary} />
            </DataTable.Cell>
            <DataTable.Cell>Current streak</DataTable.Cell>
            <DataTable.Cell numeric>
              <Chip
                compact
                mode="flat"
                style={[
                  styles.streakChip,
                  { backgroundColor: theme.colors.primaryContainer },
                ]}
              >
                <CustomText
                  variant="bodySmall"
                  style={{
                    color: theme.colors.onPrimaryContainer,
                    fontWeight: "bold",
                  }}
                >
                  {stats.currentStreak}
                </CustomText>
              </Chip>
            </DataTable.Cell>
          </DataTable.Row>

          <DataTable.Row>
            <DataTable.Cell style={styles.iconCell}>
              <Icon
                source="card-text-outline"
                size={20}
                color={theme.colors.primary}
              />
            </DataTable.Cell>
            <DataTable.Cell>Cards to go</DataTable.Cell>
            <DataTable.Cell numeric>
              <Chip
                compact
                mode="flat"
                style={[
                  styles.remainingChip,
                  {
                    backgroundColor:
                      stats.remainingCards <= 3
                        ? theme.colors.secondaryContainer
                        : theme.colors.surfaceVariant,
                  },
                ]}
              >
                <CustomText
                  variant="bodySmall"
                  style={{
                    color:
                      stats.remainingCards <= 3
                        ? theme.colors.onSecondaryContainer
                        : theme.colors.onSurfaceVariant,
                    fontWeight: stats.remainingCards <= 3 ? "bold" : "normal",
                  }}
                >
                  {stats.remainingCards}
                </CustomText>
              </Chip>
            </DataTable.Cell>
          </DataTable.Row>

          {stats.totalAnswered > 0 && (
            <DataTable.Row>
              <DataTable.Cell style={styles.iconCell}>
                <Icon
                  source={stats.trendAnalysis.icon || "trending-neutral"}
                  size={20}
                  color={stats.trendAnalysis.color}
                />
              </DataTable.Cell>
              <DataTable.Cell>Trend</DataTable.Cell>
              <DataTable.Cell numeric>
                <CustomText
                  variant="bodySmall"
                  style={[
                    styles.statValue,
                    { color: stats.trendAnalysis.color },
                  ]}
                >
                  {stats.trendAnalysis.description}
                </CustomText>
              </DataTable.Cell>
            </DataTable.Row>
          )}
        </DataTable>
      )}

      {statsTab === "performance" && (
        <DataTable>
          {stats.totalAnswered > 0 ? (
            <>
              <DataTable.Row>
                <DataTable.Cell style={styles.iconCell}>
                  <Icon
                    source="chart-line"
                    size={20}
                    color={theme.colors.primary}
                  />
                </DataTable.Cell>
                <DataTable.Cell>Accuracy</DataTable.Cell>
                <DataTable.Cell numeric>
                  <CustomText
                    variant="bodySmall"
                    style={[styles.statValue, { fontWeight: "bold" }]}
                  >
                    {stats.accuracy}%
                  </CustomText>
                </DataTable.Cell>
              </DataTable.Row>

              <DataTable.Row>
                <DataTable.Cell style={styles.iconCell}>
                  <Icon source="star" size={20} color={theme.colors.primary} />
                </DataTable.Cell>
                <DataTable.Cell>Performance</DataTable.Cell>
                <DataTable.Cell numeric>
                  <CustomText
                    variant="bodySmall"
                    style={[
                      styles.statValue,
                      {
                        color:
                          stats.accuracyPercent >= 75
                            ? theme.colors.primary
                            : theme.colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {stats.performanceLabel}
                  </CustomText>
                </DataTable.Cell>
              </DataTable.Row>

              <DataTable.Row>
                <DataTable.Cell style={styles.iconCell}>
                  <Icon source="fire" size={20} color={theme.colors.primary} />
                </DataTable.Cell>
                <DataTable.Cell>Best streak</DataTable.Cell>
                <DataTable.Cell numeric>
                  <CustomText variant="bodySmall" style={styles.statValue}>
                    {stats.bestStreak}
                  </CustomText>
                </DataTable.Cell>
              </DataTable.Row>
            </>
          ) : (
            <View style={styles.emptyStatsMessage}>
              <CustomText
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Answer cards to see performance stats
              </CustomText>
            </View>
          )}
        </DataTable>
      )}

      {statsTab === "time" && (
        <DataTable>
          <DataTable.Row>
            <DataTable.Cell style={styles.iconCell}>
              <Icon
                source="timer-outline"
                size={20}
                color={theme.colors.primary}
              />
            </DataTable.Cell>
            <DataTable.Cell>Session time</DataTable.Cell>
            <DataTable.Cell numeric>
              <CustomText variant="bodySmall" style={styles.statValue}>
                {stats.sessionDuration}
              </CustomText>
            </DataTable.Cell>
          </DataTable.Row>

          <DataTable.Row>
            <DataTable.Cell style={styles.iconCell}>
              <Icon
                source="speedometer"
                size={20}
                color={theme.colors.primary}
              />
            </DataTable.Cell>
            <DataTable.Cell>Learning pace</DataTable.Cell>
            <DataTable.Cell numeric>
              <CustomText variant="bodySmall" style={styles.statValue}>
                {stats.learningPace} cards/min
              </CustomText>
            </DataTable.Cell>
          </DataTable.Row>

          {stats.hasResponseTimes && (
            <DataTable.Row>
              <DataTable.Cell style={styles.iconCell}>
                <Icon
                  source="clock-outline"
                  size={20}
                  color={theme.colors.primary}
                />
              </DataTable.Cell>
              <DataTable.Cell>Avg. response time</DataTable.Cell>
              <DataTable.Cell numeric>
                <CustomText variant="bodySmall" style={styles.statValue}>
                  {stats.averageResponseTime} sec
                </CustomText>
              </DataTable.Cell>
            </DataTable.Row>
          )}

          {stats.remainingCards > 0 && (
            <DataTable.Row>
              <DataTable.Cell style={styles.iconCell}>
                <Icon
                  source="timer-sand"
                  size={20}
                  color={theme.colors.primary}
                />
              </DataTable.Cell>
              <DataTable.Cell>Est. time to finish</DataTable.Cell>
              <DataTable.Cell numeric>
                <CustomText variant="bodySmall" style={styles.statValue}>
                  {stats.estimatedTimeToFinish}
                </CustomText>
              </DataTable.Cell>
            </DataTable.Row>
          )}
        </DataTable>
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  statsPanel: {
    marginVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  segmentedButtons: {
    marginHorizontal: 8,
    marginVertical: 8,
  },
  statValue: {
    fontWeight: "500",
  },
  emptyStatsMessage: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  iconCell: {
    flex: 0.2,
  },
  streakChip: {
    minWidth: 32,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  remainingChip: {
    minWidth: 32,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
