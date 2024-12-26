import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import useData from "@hooks/useData";
import { formatTime } from "@utils/dateUtils";
import ProgressBar from "@components/ui/ProgressBar";
import CustomButton from "@components/ui/CustomButton";
import { router } from "expo-router";
import useAnnouncements from "@hooks/useAnnouncements";

const DashboardScreen: React.FC = () => {
  const { stats } = useData();
  const { styles: globalStyles, colors } = useThemeStyles();
  const userData = useAppSelector(selectUserData);
  const announcements = useAnnouncements();

  const validAnnouncements = announcements.filter(
    (announcement) => announcement.title && announcement.content
  );

  const {
    currentStreak = 0,
    longestStreak = 0,
    totalAnsweredQuestions: totalAnsweredQuestions = 0,
    todayAnsweredQuestions: todayAnsweredQuestions = 0,
    minutesSpentToday = 0,
    minutesSpentTotal = 0,
  } = stats || {};

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      {userData && (
        <Text style={globalStyles.title}>
          Hi, {userData.name || userData.email}!
        </Text>
      )}
      <Text style={globalStyles.text}>
        Let's continue learning Lithuanian together!
      </Text>

      {validAnnouncements.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.secondary }]}>
          {validAnnouncements.map((announcement) => (
            <View key={announcement.id}>
              <Text style={[globalStyles.bold, { color: colors.cardText }]}>
                {announcement.title}
              </Text>
              <Text style={[globalStyles.text, { color: colors.cardText }]}>
                {announcement.content}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[globalStyles.bold, { color: colors.cardText }]}>
          Today's Learning
        </Text>
        <Text style={[globalStyles.text, { color: colors.cardText }]}>
          Completed Questions: {todayAnsweredQuestions}
        </Text>
        <Text style={[globalStyles.text, { color: colors.cardText }]}>
          Time Spent Today: {formatTime(minutesSpentToday)}
        </Text>
        <ProgressBar progress={todayAnsweredQuestions / 10} />
      </View>
      <Text style={globalStyles.title}>Review Today's Words?</Text>
      <CustomButton
        title="Start Review"
        onPress={() => router.push("/dashboard/learn")}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
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
});

export default DashboardScreen;
