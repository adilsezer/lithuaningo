import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import ProgressBar from "@components/ProgressBar";
import { useAppSelector } from "@src/redux/hooks";
import { selectUserData } from "@src/redux/slices/userSlice";
import CustomButton from "@components/CustomButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

interface Stats {
  currentStreak: number;
  longestStreak: number;
  totalStudiedCards: number;
  todayStudiedCards: number;
  weeklyStudiedCards: number;
  dailyAverage: number;
  timeSpentToday: string;
  timeSpentThisWeek: string;
  timeSpentTotal: string;
  todayTotalCards: number;
}

const DashboardScreen: React.FC = () => {
  const userData = useAppSelector(selectUserData);

  const stats: Stats = {
    currentStreak: 10,
    longestStreak: 32,
    totalStudiedCards: 2500,
    todayStudiedCards: 30,
    todayTotalCards: 30,
    weeklyStudiedCards: 30,
    dailyAverage: 20,
    timeSpentToday: "30 mins",
    timeSpentThisWeek: "3 hrs",
    timeSpentTotal: "50 hrs",
  };

  const { styles: globalStyles } = useThemeStyles();

  return (
    <ScrollView style={styles.container}>
      {userData && (
        <Text style={globalStyles.title}>
          Labas, {userData.name || userData.email}!
        </Text>
      )}
      <Text style={globalStyles.text}>
        Let's continue learning Lithuanian together!
      </Text>
      <View style={styles.section}>
        <Text style={styles.cardTitle}>Today's Learning</Text>
        <Text style={styles.cardValue}>
          Cards Studied Today: {stats.todayStudiedCards}
        </Text>
        <ProgressBar progress={stats.todayStudiedCards / 100} />
        <CustomButton
          title="Continue Learning"
          onPress={() => {}}
          style={globalStyles.button}
        />
        <Text style={globalStyles.text}>
          The next challenge starts in 3 minutes...
        </Text>
      </View>
      <Text style={globalStyles.title}>Your Level Now</Text>
      <Text style={globalStyles.text}>Beginner</Text>

      <Text style={globalStyles.title}>Your Progress</Text>
      <View style={styles.row}>
        {renderStatCard("Current Streak", `${stats.currentStreak} days`)}
        {renderStatCard("Longest Streak", `${stats.longestStreak} days`)}
      </View>
      <View style={styles.row}>
        {renderStatCard("Weekly Cards Studied", `${stats.weeklyStudiedCards}`)}
        {renderStatCard("Total Cards Studied", `${stats.totalStudiedCards}`)}
      </View>
    </ScrollView>
  );

  function renderStatCard(title: string, value: string) {
    return (
      <View style={styles.statCard}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: "#ECEFF1",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    elevation: 4,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ECEFF1",
    borderRadius: 8,
    padding: 16,
    elevation: 4,
    marginHorizontal: 5, // This adds margin to the left and right of each card
  },
  stat: {
    fontSize: 16,
    color: "#757575",
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  cardValue: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    marginBottom: 10,
  },
});

export default DashboardScreen;
