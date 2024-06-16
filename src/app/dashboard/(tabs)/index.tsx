import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useAppSelector } from "@src/redux/hooks";
import { selectUserData } from "@src/redux/slices/userSlice";
import useData from "@src/hooks/useData";
import StatCard from "@components/StatCard";
import { formatTime } from "@src/utils/dateUtils";
import ProgressBar from "@components/ProgressBar";
import { determineUserLevel } from "@utils/userLevel";
import CustomButton from "@components/CustomButton";
import { router } from "expo-router";

const DashboardScreen: React.FC = () => {
  const { stats, loading } = useData();
  const { styles: globalStyles, colors } = useThemeStyles();
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
    minutesSpentToday = 0,
    minutesSpentTotal = 0,
  } = stats || {};

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {userData && (
        <Text style={globalStyles.title}>
          Labas, {userData.name || userData.email}!
        </Text>
      )}
      <Text style={globalStyles.text}>
        Let's continue learning Lithuanian together!
      </Text>
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.cardText }]}>
          Today's Learning
        </Text>
        <Text style={[styles.cardValue, { color: colors.cardText }]}>
          Cards Studied Today: {todayStudiedCards}
        </Text>
        <Text style={[styles.cardValue, { color: colors.cardText }]}>
          Time Spent Today: {formatTime(minutesSpentToday)}
        </Text>
        <ProgressBar progress={todayStudiedCards / 15} />
      </View>
      <Text style={globalStyles.title}>Review Today's Words?</Text>
      <CustomButton
        title="Start Review"
        onPress={() => router.push("/learning-session")}
      />

      <Text style={[globalStyles.title]}>Your Progress</Text>
      <View style={styles.row}>
        <StatCard title="Your Level" value={`${userLevel}`} />
      </View>
      <View style={styles.row}>
        <StatCard title="Current Streak" value={`${currentStreak} days`} />
        <StatCard title="Longest Streak" value={`${longestStreak} days`} />
      </View>
      <View style={styles.row}>
        <StatCard title="Total Cards Studied" value={`${totalStudiedCards}`} />
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
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default DashboardScreen;
