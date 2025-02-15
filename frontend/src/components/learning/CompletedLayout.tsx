import React, { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import CustomButton from "@components/ui/CustomButton";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUserChallengeStats } from "@hooks/useUserChallengeStats";
import { useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";

interface CompletedLayoutProps {
  title: string;
  subtitle: string;
  buttonText: string;
  navigationRoute: string;
  showStats: boolean;
}

const CompletedLayout: React.FC<CompletedLayoutProps> = ({
  title,
  subtitle,
  buttonText,
  navigationRoute,
  showStats,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { stats } = useUserChallengeStats();
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function calculateTimeRemaining() {
    const now = new Date();
    const nextReset = new Date();
    nextReset.setUTCHours(2, 0, 0, 0);
    if (now >= nextReset) {
      nextReset.setUTCDate(nextReset.getUTCDate() + 1);
    }
    const timeDiff = nextReset.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    return { hours, minutes, seconds };
  }

  return (
    <ScrollView>
      <CustomText style={{ marginTop: 40 }}>{title}</CustomText>
      <CustomText style={{ marginTop: 20 }}>{subtitle}</CustomText>

      {showStats && (
        <View style={styles.statsContainer}>
          {stats?.todayTotalAnswers !== undefined && (
            <View style={styles.statItem}>
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={theme.colors.primary}
              />
              <CustomText style={styles.statText}>
                {stats?.todayTotalAnswers}
              </CustomText>
              <CustomText>Total Questions</CustomText>
            </View>
          )}

          {stats?.todayCorrectAnswers !== undefined && (
            <View style={styles.statItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="green"
              />
              <CustomText style={styles.statText}>
                {stats?.todayCorrectAnswers}
              </CustomText>
              <CustomText>Correct Answers</CustomText>
            </View>
          )}

          {stats?.todayTotalAnswers !== undefined &&
            stats?.todayCorrectAnswers !== undefined && (
              <View style={styles.statItem}>
                <Ionicons name="close-circle-outline" size={24} color="red" />
                <CustomText style={styles.statText}>
                  {stats?.todayTotalAnswers - stats?.todayCorrectAnswers}
                </CustomText>
                <CustomText>Wrong Answers</CustomText>
              </View>
            )}
        </View>
      )}

      {showStats && (
        <View style={styles.timerContainer}>
          <CustomText>Next challenge available in:</CustomText>
          <CustomText>
            {`${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s`}
          </CustomText>
        </View>
      )}

      <CustomButton
        title={buttonText}
        onPress={() => router.push(navigationRoute)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statText: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 5,
  },
  timerContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
});

export default CompletedLayout;
