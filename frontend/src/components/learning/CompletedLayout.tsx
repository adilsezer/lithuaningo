import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";
import CustomButton from "@components/ui/CustomButton";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import useData from "@hooks/useData";

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
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const router = useRouter();
  const { stats } = useData();
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
      <Text style={[globalStyles.title, { marginTop: 40 }]}>{title}</Text>
      <Text style={[globalStyles.subtitle, { marginTop: 20 }]}>{subtitle}</Text>
      {showStats && (
        <View style={styles.statsContainer}>
          {stats?.todayAnsweredQuestions !== undefined && (
            <View style={styles.statItem}>
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={globalColors.primary}
              />
              <Text style={[globalStyles.text, styles.statText]}>
                {stats.todayAnsweredQuestions}
              </Text>
              <Text style={globalStyles.text}>Total Questions</Text>
            </View>
          )}
          {stats?.todayCorrectAnsweredQuestions !== undefined && (
            <View style={styles.statItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="green"
              />
              <Text style={[globalStyles.text, styles.statText]}>
                {stats?.todayCorrectAnsweredQuestions}
              </Text>
              <Text style={globalStyles.text}>Correct Answers</Text>
            </View>
          )}
          {stats?.todayWrongAnsweredQuestions !== undefined && (
            <View style={styles.statItem}>
              <Ionicons name="close-circle-outline" size={24} color="red" />
              <Text style={[globalStyles.text, styles.statText]}>
                {stats?.todayWrongAnsweredQuestions}
              </Text>
              <Text style={globalStyles.text}>Wrong Answers</Text>
            </View>
          )}
        </View>
      )}
      {showStats && (
        <View style={styles.timerContainer}>
          <Text style={globalStyles.subtitle}>
            Next challenge available in:
          </Text>
          <Text style={globalStyles.title}>
            {`${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s`}
          </Text>
        </View>
      )}

      <CustomButton
        title={buttonText}
        onPress={() => router.push(navigationRoute)}
        style={{
          backgroundColor: globalColors.primary,
          marginTop: 20,
        }}
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
