// screens/DashboardScreen.tsx
import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useAppSelector } from "@src/redux/hooks";
import { selectUserData } from "@src/redux/slices/userSlice";
import useFetchData from "@src/hooks/useFetchData";
import StatCard from "@components/StatCard";
import { formatTime } from "@src/utils/dateUtils";
import ProgressBar from "@components/ProgressBar";
import StatusLabel from "@components/StatusLabel";
import { determineUserLevel } from "@utils/userLevel";

const DashboardScreen: React.FC = () => {
  const { stats, loading } = useFetchData();
  const { styles: globalStyles } = useThemeStyles();
  const userData = useAppSelector(selectUserData);
  const userLevel = determineUserLevel(stats);

  if (loading) {
    return (
      <View style={globalStyles.layoutContainer}>
        <Text style={globalStyles.subtitle}>Loading stats...</Text>
      </View>
    );
  }

  const {
    currentStreak = 0,
    longestStreak = 0,
    totalStudiedCards = 0,
    todayStudiedCards = 0,
    weeklyStudiedCards = 0,
    minutesSpentToday = 0,
    minutesSpentThisWeek = 0,
    minutesSpentTotal = 0,
  } = stats || {};

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
          Cards Studied Today: {todayStudiedCards}
        </Text>
        <Text style={styles.cardValue}>
          Time Spent Today: {formatTime(minutesSpentToday)}
        </Text>
        <ProgressBar progress={todayStudiedCards / 100} />
      </View>
      <Text style={globalStyles.title}>Your Level Now</Text>
      <StatusLabel label={userLevel} />
      <Text style={[globalStyles.title]}>Your Progress</Text>
      <View style={styles.row}>
        <StatCard title="Current Streak" value={`${currentStreak} days`} />
        <StatCard title="Longest Streak" value={`${longestStreak} days`} />
      </View>
      <View style={styles.row}>
        <StatCard
          title="Weekly Cards Studied"
          value={`${weeklyStudiedCards}`}
        />
        <StatCard title="Total Cards Studied" value={`${totalStudiedCards}`} />
      </View>
      <View style={styles.row}>
        <StatCard
          title="Time Spent This Week"
          value={formatTime(minutesSpentThisWeek)}
        />
        <StatCard
          title="Time Spent Total"
          value={formatTime(minutesSpentTotal)}
        />
      </View>
    </ScrollView>
  );
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
    marginTop: 8,
    marginBottom: 20,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 16,
    color: "#757575",
    marginBottom: 10,
  },
});

export default DashboardScreen;
