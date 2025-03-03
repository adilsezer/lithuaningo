import React from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import {
  Card,
  Divider,
  Avatar,
  Button,
  Icon,
  DataTable,
} from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import HeaderWithBackButton from "@components/layout/HeaderWithBackButton";
import { CompletedScreenProps } from "../../types/practiceTypes";

export const CompletedScreen: React.FC<CompletedScreenProps> = ({
  stats,
  handleRestartPractice,
  theme,
}) => {
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <HeaderWithBackButton title="Practice Complete" />
      <View style={styles.completedContainer}>
        <Card style={styles.completedCard}>
          <View style={styles.contentWrapper}>
            <Card.Content>
              <View style={styles.successIconContainer}>
                <Avatar.Icon
                  size={80}
                  icon="trophy"
                  color={theme.colors.onPrimaryContainer}
                  style={{ backgroundColor: theme.colors.primaryContainer }}
                />
              </View>
              <CustomText
                variant="headlineSmall"
                style={[styles.completedText, { color: theme.colors.primary }]}
              >
                Congratulations!
              </CustomText>
              <CustomText
                variant="bodyLarge"
                style={{
                  color: theme.colors.onSurfaceVariant,
                  textAlign: "center",
                }}
              >
                You've successfully completed this deck!
              </CustomText>

              <Divider style={styles.divider} />

              <DataTable style={styles.statsContainer}>
                <DataTable.Row>
                  <DataTable.Cell style={styles.iconCell}>
                    <Icon
                      source="cards"
                      size={20}
                      color={theme.colors.primary}
                    />
                  </DataTable.Cell>
                  <DataTable.Cell>Total cards</DataTable.Cell>
                  <DataTable.Cell numeric>
                    <CustomText variant="bodyMedium" style={styles.statValue}>
                      {stats.totalCards}
                    </CustomText>
                  </DataTable.Cell>
                </DataTable.Row>

                <DataTable.Row>
                  <DataTable.Cell style={styles.iconCell}>
                    <Icon
                      source="counter"
                      size={20}
                      color={theme.colors.primary}
                    />
                  </DataTable.Cell>
                  <DataTable.Cell>Total attempts</DataTable.Cell>
                  <DataTable.Cell numeric>
                    <CustomText variant="bodyMedium" style={styles.statValue}>
                      {stats.totalAnswered}
                    </CustomText>
                  </DataTable.Cell>
                </DataTable.Row>

                <DataTable.Row>
                  <DataTable.Cell style={styles.iconCell}>
                    <Icon
                      source="percent"
                      size={20}
                      color={theme.colors.primary}
                    />
                  </DataTable.Cell>
                  <DataTable.Cell>Accuracy rate</DataTable.Cell>
                  <DataTable.Cell numeric>
                    <CustomText
                      variant="bodyMedium"
                      style={[styles.statValue, { fontWeight: "bold" }]}
                    >
                      {stats.accuracy}%
                    </CustomText>
                  </DataTable.Cell>
                </DataTable.Row>

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
                    <CustomText variant="bodyMedium" style={styles.statValue}>
                      {stats.sessionDuration}
                    </CustomText>
                  </DataTable.Cell>
                </DataTable.Row>

                <DataTable.Row>
                  <DataTable.Cell style={styles.iconCell}>
                    <Icon
                      source="fire"
                      size={20}
                      color={theme.colors.primary}
                    />
                  </DataTable.Cell>
                  <DataTable.Cell>Best streak</DataTable.Cell>
                  <DataTable.Cell numeric>
                    <CustomText variant="bodyMedium" style={styles.statValue}>
                      {stats.bestStreak}
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
                    <CustomText variant="bodyMedium" style={styles.statValue}>
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
                      <CustomText variant="bodyMedium" style={styles.statValue}>
                        {stats.averageResponseTime} sec
                      </CustomText>
                    </DataTable.Cell>
                  </DataTable.Row>
                )}
              </DataTable>
            </Card.Content>
          </View>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            icon="home"
            onPress={() => router.push("/dashboard/decks")}
            style={[styles.button, { flex: 1 }]}
          >
            Back to Decks
          </Button>
          <Button
            mode="outlined"
            icon="refresh"
            onPress={handleRestartPractice}
            style={[
              styles.button,
              { flex: 1, borderColor: theme.colors.primary },
            ]}
          >
            Restart
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  completedContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  completedCard: {
    borderRadius: 16,
    marginBottom: 16,
  },
  contentWrapper: {
    overflow: "hidden",
    borderRadius: 16,
  },
  completedText: {
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "700",
  },
  successIconContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  divider: {
    marginVertical: 16,
  },
  statsContainer: {
    marginTop: 8,
  },
  iconCell: {
    flex: 0.2,
  },
  statValue: {
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  button: {
    borderRadius: 8,
  },
});
